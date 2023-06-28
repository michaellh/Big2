// const jwt = require("jsonwebtoken");
import { PubSub } from "graphql-subscriptions";
import { clients, deckOfCards } from "./utils/test_data";
import { GameState, PlayerAction } from "./schema";
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
      gameState.currentMove.playersInPlay = gameState.turnRotation;

      gameState.playerStates = clients.map((client) => ({
        player: client,
        cardCount: 13,
      }));

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
    playerMove: (_root: unknown, args: { playerAction: PlayerAction }) => {
      const { name, action, cardsPlayed } = args.playerAction;

      if (action === "play") {
        const { updatedGameState, success } = updateGameStateFromPlay(
          { name, action, cardsPlayed },
          gameState
        );

        if (success) {
          gameState = updatedGameState;
          pubsub.publish("PLAYER_MOVE", { playerMove: gameState });
        } else {
          throw new GraphQLError("trash play");
        }
      }

      if (action === "pass") {
        gameState.currentMove.playersInPlay.shift();
        const shiftPlayer = gameState.turnRotation.shift()?.toString();

        if (shiftPlayer) {
          gameState.turnRotation.push(shiftPlayer);
        }

        if (gameState.currentMove.playersInPlay.length === 1) {
          while (gameState.turnRotation[0] !== gameState.currentMove.player) {
            const shiftPlayer = gameState.turnRotation.shift()?.toString();

            if (shiftPlayer) {
              gameState.turnRotation.push(shiftPlayer);
            }
          }
          gameState.currentMove.playersInPlay = gameState.turnRotation;
          gameState.currentMove.player = "";
          gameState.currentMove.cards = [];
          gameState.currentMove.type = "";
        }

        pubsub.publish("PLAYER_MOVE", { playerMove: gameState });
      }

      return gameState;
    },
  },
  Subscription: {
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
