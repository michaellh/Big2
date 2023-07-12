import jwt from 'jsonwebtoken';
import { PubSub } from 'graphql-subscriptions';
import { GraphQLError } from 'graphql';
import { Types } from 'mongoose';
import UserModel, { IUser } from './models/user';
import LobbyModel from './models/lobby';
import GameStateModel from './models/gameState';
import deckOfCards from './utils/test_data';
import { GameInput, PlayerAction } from './schema';
import {
  selectRandomCards,
  updateGameStateFromPlay,
} from './utils/resolvers_helpers';
import config from './utils/config';

const pubsub = new PubSub();

const resolvers = {
  Query: {
    allPlayers: () => UserModel.find({}),
  },
  Mutation: {
    hostGame: async (_root: unknown, args: { gameInput: GameInput }) => {
      try {
        const { name, roomName } = args.gameInput;

        const lobbyCodeExists = await LobbyModel.findOne({ code: roomName });
        if (lobbyCodeExists) {
          throw new GraphQLError('Lobby code already exists!', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: roomName,
            },
          });
        }

        const hostUser = new UserModel({ name });
        await hostUser.save();
        const hostUserId = hostUser._id;

        const lobby = new LobbyModel({
          code: roomName,
          host: hostUserId,
          players: [hostUserId],
        });
        await lobby.save();
        const lobbyId = lobby._id;

        const token = jwt.sign(hostUserId.toString(), config.JWT_SECRET);

        return {
          lobbyId,
          token,
        };
      } catch (err) {
        throw new GraphQLError(`Attempt to host game failed: ${err}`);
      }
    },
    joinGame: async (_root: unknown, args: { gameInput: GameInput }) => {
      try {
        const { name, roomName } = args.gameInput;

        const lobbyExists = await LobbyModel.findOne({ code: roomName });
        if (lobbyExists) {
          const newUser = new UserModel({ name });
          await newUser.save();
          const newUserId = newUser._id;

          lobbyExists.players.push(newUserId);
          await lobbyExists.save();
          const lobbyId = lobbyExists._id;

          const token = jwt.sign(newUserId.toString(), config.JWT_SECRET);

          return {
            lobbyId,
            token,
          };
        }

        throw new GraphQLError('Failed to find lobby!', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: roomName,
          },
        });
      } catch (err) {
        throw new GraphQLError(`Attempt to join game failed: ${err}`);
      }
    },
    startGame: async (
      _root: unknown,
      _args: unknown,
      context: { userId: string },
    ) => {
      try {
        const { userId } = context;

        const lobbyExists = await LobbyModel.findOne({
          host: new Types.ObjectId(userId),
        }).populate<{ players: IUser[] }>('players');
        if (!lobbyExists) {
          throw new GraphQLError('User is not the host of a lobby!', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: userId,
            },
          });
        }

        const { players } = lobbyExists;
        if (players.length < 2 || players.length > 4) {
          throw new GraphQLError('Minimum 2 players and maximum 4 players!', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: userId,
            },
          });
        }

        const distributedCards = selectRandomCards(deckOfCards, players.length);
        let lowestCardId = 51;
        let lowestCardPlayerIndex = -1;
        for (let i = 0; i < distributedCards.length; i += 1) {
          distributedCards[i].sort((a, b) => a.id - b.id);
          if (distributedCards[i][0].id < lowestCardId) {
            lowestCardId = distributedCards[i][0].id;
            lowestCardPlayerIndex = i;
          }
        }

        if (lowestCardPlayerIndex > 0) {
          const rotatedCardSets = distributedCards.splice(
            0,
            lowestCardPlayerIndex,
          );
          distributedCards.push(...rotatedCardSets);
          const rotatedPlayers = players.splice(0, lowestCardPlayerIndex);
          players.push(...rotatedPlayers);
        }

        const gameState = new GameStateModel({});
        gameState.turnRotation = players.map((player) => player.name);
        Object.assign(gameState, {
          currentMove: {
            cards: [],
            play: '',
            player: gameState.turnRotation[0],
            playersInPlay: gameState.turnRotation,
          },
          playerStates: players.map((player) => ({
            player: player.name,
            cardCount: 13,
            placementRank: 0,
          })),
          nextPlacementRank: 1,
        });
        await gameState.save();
        const gameStateId = gameState._id;
        lobbyExists.gameState = gameStateId;
        await lobbyExists.save();

        await Promise.all(
          players.map(async (player, index) => {
            await pubsub.publish(`GAME_START_${player._id.toString()}`, {
              gameStart: {
                cards: distributedCards[index],
                gameState,
              },
            });
          }),
        );
      } catch (err) {
        throw new GraphQLError(`Attempt to start game failed: ${err}`);
      }
    },
    playerMove: async (
      _root: unknown,
      args: { playerAction: PlayerAction },
      context: { userId: string },
    ) => {
      const { action, cardsPlayed } = args.playerAction;
      const { userId } = context;

      const user = await UserModel.findById(userId);
      if (!user) {
        throw new GraphQLError('Player user does not exist!', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: userId,
          },
        });
      }

      const lobby = await LobbyModel.findOne({
        players: userId,
      }).populate('gameState');
      const gameState = await GameStateModel.findById(lobby?.gameState._id);
      if (!gameState) {
        throw new GraphQLError('Player belongs to no existing games!', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: userId,
          },
        });
      }

      if (action === 'play') {
        const { updatedGameState, success, failCause } =
          updateGameStateFromPlay(
            user.name,
            { action, cardsPlayed },
            gameState,
          );

        if (success) {
          Object.assign(gameState, {
            turnRotation: updatedGameState.turnRotation,
            currentMove: updatedGameState.currentMove,
            playerStates: updatedGameState.playerStates,
            nextPlacementRank: updatedGameState.nextPlacementRank,
          });
          await gameState.save();

          await pubsub.publish('PLAYER_MOVE', { playerMove: gameState });
        } else {
          throw new GraphQLError(failCause, {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: cardsPlayed,
            },
          });
        }
      }

      if (action === 'pass') {
        gameState.currentMove.playersInPlay.shift();
        const shiftPlayer = gameState.turnRotation.shift();
        if (shiftPlayer) {
          gameState.turnRotation.push(shiftPlayer);
        }

        if (gameState.currentMove.playersInPlay.length === 1) {
          while (gameState.turnRotation[0] !== gameState.currentMove.player) {
            const rotatePlayer = gameState.turnRotation.shift();

            if (rotatePlayer) {
              gameState.turnRotation.push(rotatePlayer);
            }
          }

          gameState.currentMove.playersInPlay = gameState.turnRotation;
          const [firstPlayer] = gameState.turnRotation;
          Object.assign(gameState.currentMove, {
            player: firstPlayer,
            cards: [],
            play: '',
          });
          await gameState.save();
        }
        await pubsub.publish('PLAYER_MOVE', { playerMove: gameState });
      }
    },
  },
  Subscription: {
    gameStart: {
      subscribe: (
        _root: unknown,
        _args: unknown,
        context: { userId: string },
      ) => pubsub.asyncIterator(`GAME_START_${context.userId}`),
    },
    playerMove: {
      subscribe: () => pubsub.asyncIterator('PLAYER_MOVE'),
    },
  },
};

export default resolvers;
