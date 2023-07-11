import jwt from 'jsonwebtoken';
import { PubSub } from 'graphql-subscriptions';
import { GraphQLError } from 'graphql';
import { Types } from 'mongoose';
import UserModel from './models/user';
import LobbyModel from './models/lobby';
import GameStateModel from './models/gameState';
import deckOfCards from './utils/test_data';
import { PlayerAction, GameInput } from './schema';
import {
  selectRandomCards,
  updateGameStateFromPlay,
  isCardLower,
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
      context: { user: string },
    ) => {
      try {
        const { user } = context;
        let players: Types.ObjectId[] = [];

        const lobbyExists = await LobbyModel.findOne({
          host: new Types.ObjectId(user),
        });
        if (lobbyExists) {
          players = lobbyExists.players;
        } else {
          throw new GraphQLError('User is not the host of a lobby!', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: user,
            },
          });
        }
        if (players.length < 2) {
          throw new GraphQLError(
            'Minimum # of players to start a new game is 2!',
            {
              extensions: {
                code: 'BAD_USER_INPUT',
                invalidArgs: user,
              },
            },
          );
        }

        const distributedCards = selectRandomCards(deckOfCards, players.length);
        const { player: lowestCardPlayer } = distributedCards.reduce(
          (lowest, cards, index) => {
            cards.sort((a, b) => a.id - b.id);

            const lowestCard = cards[0];
            if (isCardLower(lowestCard, lowest.card)) {
              return {
                player: players[index].toString(),
                card: lowestCard,
              };
            }
            return lowest;
          },
          {
            player: '',
            card: {
              id: 51,
              value: 15,
              suit: 4,
            },
          },
        );
        const firstPlayer = new Types.ObjectId(lowestCardPlayer);

        const gameState = new GameStateModel({});
        gameState.turnRotation = players.filter(
          (player) => !player.equals(firstPlayer),
        );
        gameState.turnRotation.unshift(firstPlayer);
        gameState.currentMove = {
          cards: [],
          play: '',
          player: firstPlayer,
          playersInPlay: gameState.turnRotation,
        };
        gameState.playerStates = players.map((player) => ({
          player,
          cardCount: 13,
          placementRank: 0,
        }));
        gameState.nextPlacementRank = 1;
        await gameState.save();
        await Promise.all(
          players.map(async (player, index) => {
            await pubsub.publish(`GAME_START_${player.toString()}`, {
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
      context: { user: string },
    ) => {
      const { action, cardsPlayed } = args.playerAction;
      const { user } = context;

      const userId = new Types.ObjectId(user);
      const gameState = await GameStateModel.findOne({
        playerStates: {
          $elemMatch: { player: userId },
        },
      });

      if (gameState) {
        if (action === 'play') {
          const { updatedGameState, success, failCause } =
            updateGameStateFromPlay(userId, { action, cardsPlayed }, gameState);

          if (success) {
            gameState.turnRotation = updatedGameState.turnRotation;
            gameState.currentMove = updatedGameState.currentMove;
            gameState.playerStates = updatedGameState.playerStates;
            gameState.nextPlacementRank = updatedGameState.nextPlacementRank;
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
            while (
              !gameState.turnRotation[0].equals(gameState.currentMove.player)
            ) {
              const rotatePlayer = gameState.turnRotation.shift();

              if (rotatePlayer) {
                gameState.turnRotation.push(rotatePlayer);
              }
            }

            gameState.currentMove.playersInPlay = gameState.turnRotation;
            const [firstPlayer] = gameState.turnRotation;
            gameState.currentMove.player = firstPlayer;
            gameState.currentMove.cards = [];
            gameState.currentMove.play = '';

            await gameState.save();
          }
          await pubsub.publish('PLAYER_MOVE', { playerMove: gameState });
        }
      } else {
        throw new GraphQLError('Player belongs to no existing games!', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: user,
          },
        });
      }
    },
    // endGame: async (
    //   _root: unknown,
    //   args: { playerAction: PlayerAction },
    //   context: { user: string },
    // ) => {
    //   // needs to receive the gamestate _id to delete it from the client
    // }
  },
  Subscription: {
    gameStart: {
      subscribe: (_root: unknown, _args: unknown, context: { user: string }) =>
        pubsub.asyncIterator(`GAME_START_${context.user}`),
    },
    playerMove: {
      subscribe: () => pubsub.asyncIterator('PLAYER_MOVE'),
    },
  },
};

export default resolvers;
