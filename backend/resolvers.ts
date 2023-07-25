import jwt from 'jsonwebtoken';
import { PubSub } from 'graphql-subscriptions';
import { GraphQLError } from 'graphql';
import { Types } from 'mongoose';
import UserModel, { IUser } from './models/user';
import LobbyModel from './models/lobby';
import GameStateModel, { IPlayerState } from './models/gameState';
import { DECK_OF_CARDS } from './utils/enums';
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
    getLobby: async (
      _root: unknown,
      _args: unknown,
      context: { userId: string },
    ) => {
      const { userId } = context;

      try {
        const lobby = await LobbyModel.findOne({
          players: userId,
        }).populate<{ code: string; host: IUser; players: IUser[] }>([
          'host',
          'players',
        ]);

        if (lobby) {
          return {
            _id: lobby._id,
            code: lobby.code,
            host: lobby.host.name,
            players: lobby.players.map((player) => player.name),
          };
        }

        throw new GraphQLError('You belong to no lobbies!', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: userId,
          },
        });
      } catch (error) {
        return error;
      }
    },
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

        const hostUser = new UserModel({ name, last_active: new Date() });
        await hostUser.save();
        const hostUserId = hostUser._id;

        const lobby = new LobbyModel({
          code: roomName,
          host: hostUserId,
          players: [hostUserId],
        });
        await lobby.save();

        const token = jwt.sign(hostUserId.toString(), config.JWT_SECRET);

        return { token };
      } catch (err) {
        throw new GraphQLError(`Attempt to host game failed: ${err}`);
      }
    },
    joinGame: async (_root: unknown, args: { gameInput: GameInput }) => {
      try {
        const { name, roomName } = args.gameInput;

        const lobbyExists = await LobbyModel.findOne({ code: roomName });
        if (lobbyExists) {
          if (lobbyExists.players.length >= 4) {
            throw new GraphQLError('Lobby is full!', {
              extensions: {
                code: 'BAD_USER_INPUT',
                invalidArgs: roomName,
              },
            });
          }

          const newUser = new UserModel({ name });
          await newUser.save();
          const newUserId = newUser._id;

          lobbyExists.players.push(newUserId);
          await lobbyExists.save();

          const token = jwt.sign(newUserId.toString(), config.JWT_SECRET);

          return { token };
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
    // changePlayerOrder: async (_root: unknown, args: { newOrder: string[] }, context: { userId: string }) => {
    //   try {
    //     const { newOrder } = args;
    //     const { userId } = context;

    //     const lobbyExists = await LobbyModel.findOne({
    //       host: new Types.ObjectId(userId),
    //     }).populate<{ players: IUser[] }>('players');
    //     if (!lobbyExists) {
    //       throw new GraphQLError('User is not the host of a lobby!', {
    //         extensions: {
    //           code: 'BAD_USER_INPUT',
    //           invalidArgs: userId,
    //         },
    //       });
    //     }

    //     const updatedOrder: IUser[] = [];
    //     for (let i = 0; i < lobbyExists.players.length; i += 1) {

    //     }
    //     lobbyExists.players.forEach(player => );
    //   } catch (err) {
    //     throw new GraphQLError(`Attempt to change player order failed: ${err}`);
    //   }
    // },
    startGame: async (
      _root: unknown,
      _args: unknown,
      context: { userId: string },
    ) => {
      try {
        const { userId } = context;

        const lobbyExists = await LobbyModel.findOne({
          host: new Types.ObjectId(userId),
        }).populate<{ host: IUser; players: IUser[] }>('players');
        if (!lobbyExists) {
          throw new GraphQLError('User is not the host of a lobby!', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: userId,
            },
          });
        }

        const { host, players } = lobbyExists;
        if (players.length < 2 || players.length > 4) {
          throw new GraphQLError('Minimum 2 players and maximum 4 players!', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: userId,
            },
          });
        }

        const distributedCards = selectRandomCards(
          DECK_OF_CARDS,
          players.length,
        );
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
        const playerStates: IPlayerState[] = [];
        players.map(async (player, index) => {
          playerStates.push({
            player: player.name,
            cards: distributedCards[index],
            placementRank: 0,
          });
        });
        Object.assign(gameState, {
          currentMove: {
            cards: [],
            play: '',
            player: gameState.turnRotation[0],
            playersInPlay: gameState.turnRotation,
          },
          playerStates,
          nextPlacementRank: 1,
        });
        await gameState.save();
        const gameStateId = gameState._id;
        lobbyExists.gameState = gameStateId;
        await lobbyExists.save();

        await UserModel.findByIdAndUpdate(host._id, {
          last_active: new Date(),
        });

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

      if (user.name !== gameState.currentMove.playersInPlay[0]) {
        throw new GraphQLError(
          `${user.name}, it's ${gameState.currentMove.playersInPlay[0]}'s turn`,
          {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: userId,
            },
          },
        );
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
        }
        await gameState.save();
        await pubsub.publish('PLAYER_MOVE', { playerMove: gameState });
      }

      if (gameState.turnRotation.length <= 1) {
        await GameStateModel.findByIdAndRemove(gameState._id);
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
