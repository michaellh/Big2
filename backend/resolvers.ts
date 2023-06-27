// const jwt = require("jsonwebtoken");
import { PubSub } from "graphql-subscriptions";
import { clients, deckOfCards } from "./utils/test_data";
import { Card, GameState } from "./schema";
import {
  selectRandomCards,
  updateGameStateFromPlay,
  isCardLower,
} from "./utils/resolvers_helpers";
import { GraphQLError } from "graphql";

const pubsub = new PubSub();

let gameState: GameState = {
  turnRotation: clients,
  currentMove: {
    cards: [],
    type: "",
    player: "",
    playersInPlay: clients,
  },
  playerStates: [
    {
      player: "",
      cardCount: 0,
    },
  ],
};

const resolvers = {
  Query: {
    clientCount: () => clients.length,
    allClients: () => clients,
  },
  Mutation: {
    joinGame: (_root: unknown, args: { name: string }) => {
      clients.push(args.name);
      pubsub.publish("CLIENT_ADDED", { clientAdded: args.name });

      return args.name;
    },
    startGame: () => {
      const distributedCards = selectRandomCards(deckOfCards, clients.length);
      const lowestCardPlayer = distributedCards.reduce(
        (lowest, cards, index) => {
          cards.sort((a, b) => {
            if (a.value !== b.value) {
              return a.value - b.value;
            }
            return a.suit - b.suit;
          });

          const lowestCard = cards[0];
          if (isCardLower(lowestCard, lowest.card)) {
            lowest.player = clients[index];
            lowest.card = lowestCard;
          }
          return lowest;
        },
        {
          player: "",
          card: {
            id: 51,
            value: 15,
            suit: 4,
          },
        }
      );

      gameState.turnRotation = gameState.turnRotation.filter(
        (player) => player !== lowestCardPlayer.player
      );
      gameState.turnRotation.unshift(lowestCardPlayer.player);
      gameState.playerStates = clients.map((client) => {
        return {
          player: client,
          cardCount: 13,
        };
      });

      clients.forEach((client, index) => {
        pubsub.publish(`GAME_START_${client}`, {
          gameStart: {
            cards: distributedCards[index],
            gameState,
          },
        });
      });

      return gameState;
    },
    playerMove: (
      _root: unknown,
      args: { name: string; action: string; cardsPlayed: Card[] }
    ) => {
      const { name, action, cardsPlayed } = args;
      console.log(cardsPlayed);
      if (action === "play") {
        const { updatedGameState, success } = updateGameStateFromPlay(
          {
            name,
            action,
            cardsPlayed,
          },
          gameState
        );

        if (success) {
          gameState = updatedGameState;
          // send publish
          pubsub.publish("PLAYER_MOVE", gameState);
        } else {
          throw new GraphQLError("trash play");
        }
      }
      if (action === "pass") {
        gameState.currentMove.playersInPlay =
          gameState.currentMove.playersInPlay.filter(
            (player) => player !== name
          );
        // send publish
        pubsub.publish("PLAYER_MOVE", gameState);
      }

      return gameState;
    },
  },
  Subscription: {
    clientAdded: {
      subscribe: () => pubsub.asyncIterator("CLIENT_ADDED"),
    },
    gameStart: {
      subscribe: (_: unknown, { name }: { name: string }) =>
        pubsub.asyncIterator(`GAME_START_${name}`),
    },
    playerMove: {
      subscribe: () => pubsub.asyncIterator("PLAYER_MOVE"),
    },
  },
};

export default resolvers;
