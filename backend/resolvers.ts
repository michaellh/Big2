import jwt from 'jsonwebtoken';
import { PubSub } from 'graphql-subscriptions';
import { GraphQLError } from 'graphql';
import User from './models/user';
import Lobby from './models/lobby';
import GameStateModel from './models/gameState';
import { deckOfCards } from './utils/test_data';
import { PlayerAction, GameInput } from './schema';
import {
  selectRandomCards,
  updateGameStateFromPlay,
  isCardLower,
} from './utils/resolvers_helpers';
import config from './utils/config';
import { Types } from 'mongoose';

const pubsub = new PubSub();

const resolvers = {
  Query: {
    allPlayers: () => {
      return User.find({});
    },
  },
  Mutation: {
    hostGame: async (_root: unknown, args: { gameInput: GameInput }) => {
      try {
        const { name, roomName } = args.gameInput;

        if (typeof name !== 'string') {
          throw new Error('Invalid name');
        }

        const hostUser = new User({ name });
        await hostUser.save();
        const hostUserId = hostUser._id;

        const lobby = new Lobby({
          code: roomName,
          host: hostUserId,
          players: [hostUserId],
        });
        await lobby.save();

        const token = jwt.sign(hostUserId.toString(), config.JWT_SECRET);

        return token;
      } catch (error) {
        throw new GraphQLError('Attempt to host game failed!');
      }
    },
    joinGame: async (_root: unknown, args: { gameInput: GameInput }) => {
      try {
        const { name, roomName } = args.gameInput;
        const newUser = new User({ name });

        await newUser.save();
        const newUserId = newUser._id;

        const lobby = await Lobby.findOne({ code: roomName });
        if (lobby) {
          lobby.players.push(newUserId);
          await lobby.save();
        } else {
          throw new GraphQLError('Failed to find lobby!');
        }

        const token = jwt.sign(newUserId.toString(), config.JWT_SECRET);

        return token;
      } catch (err) {
        throw new GraphQLError('Attempt to join game failed!');
      }
    },
    startGame: async (
      _root: unknown,
      _args: unknown,
      context: { user: string }
    ) => {
      try {
        let players: Types.ObjectId[] = [];

        const lobby = await Lobby.findOne({
          host: new Types.ObjectId(context.user),
        });
        if (lobby) {
          players = lobby.players;
        } else {
          throw new GraphQLError('Failed to find lobby!');
        }
        const distributedCards = selectRandomCards(deckOfCards, players.length);

        const { player: lowestCardPlayer } = distributedCards.reduce(
          (lowest, cards, index) => {
            cards.sort((a, b) => {
              if (a.value !== b.value) {
                return a.value - b.value;
              }
              return a.suit - b.suit;
            });

            const lowestCard = cards[0];
            if (isCardLower(lowestCard, lowest.card)) {
              lowest.player = players[index].toString();
              lowest.card = lowestCard;
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
          }
        );
        const firstPlayer = new Types.ObjectId(lowestCardPlayer);

        const gameState = new GameStateModel({});
        gameState.turnRotation = players.filter(
          (player) => !player.equals(firstPlayer)
        );
        gameState.turnRotation.unshift(firstPlayer);
        gameState.currentMove = {
          cards: [],
          play: '',
          player: firstPlayer,
          playersInPlay: gameState.turnRotation,
        };
        gameState.playerStates = players.map((player) => ({
          player: player,
          cardCount: 13,
        }));
        await gameState.save();

        players.forEach((player, index) => {
          pubsub.publish(`GAME_START_${player.toString()}`, {
            gameStart: {
              cards: distributedCards[index],
              gameState,
            },
          });
        });
      } catch (err) {
        throw new GraphQLError(`Attempt to start game failed: ${err}`);
      }
    },
    playerMove: async (
      _root: unknown,
      args: { playerAction: PlayerAction },
      context: { user: string }
    ) => {
      const { action, cardsPlayed } = args.playerAction;
      const { user } = context;
      const userId = new Types.ObjectId(user);
      let gameState = await GameStateModel.findOne({
        playerStates: {
          $elemMatch: { player: userId },
        },
      });

      if (gameState) {
        if (action === 'play') {
          const { updatedGameState, success } = updateGameStateFromPlay(
            userId,
            { action, cardsPlayed },
            gameState
          );

          if (success) {
            gameState.turnRotation = updatedGameState.turnRotation;
            gameState.currentMove = updatedGameState.currentMove;
            gameState.playerStates = updatedGameState.playerStates;
            await gameState.save();

            pubsub.publish('PLAYER_MOVE', { playerMove: gameState });
          } else {
            throw new GraphQLError('trash play');
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
              const shiftPlayer = gameState.turnRotation.shift();

              if (shiftPlayer) {
                gameState.turnRotation.push(shiftPlayer);
              }
            }

            gameState.currentMove.playersInPlay = gameState.turnRotation;
            gameState.currentMove.player = gameState.turnRotation[0];
            gameState.currentMove.cards = [];
            gameState.currentMove.play = '';

            await gameState.save();
          }
          pubsub.publish('PLAYER_MOVE', { playerMove: gameState });
        }
      } else {
        throw new GraphQLError('Invalid player!');
      }

      return gameState;
    },
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
