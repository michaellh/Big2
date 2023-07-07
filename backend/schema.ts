import { Types } from 'mongoose';

const typeDefs = `
  type Query {
    allPlayers: [String]!
  }
  type Mutation {
    hostGame(gameInput: GameInput!): GameOutput!
    joinGame(gameInput: GameInput!): GameOutput! 
    startGame: Void
    playerMove(playerAction: PlayerAction!): GameState!
  }
  type Subscription {
    gameStart: GameStartState!
    playerMove: GameState!
  }
  type User {
    name: String!
  }
  input GameInput {
    name: String!
    roomName: String!
  }
  type GameOutput {
    lobbyId: String!
    token: String!
  }
  type Card {
    id: Int!
    value: Int!
    suit: Int!
  }
  input CardInput {
    id: Int!
    value: Int!
    suit: Int!
  }
  input PlayerAction {
    action: String!
    cardsPlayed: [CardInput!]!
  }
  type CurrentMove {
    cards: [Card]
    play: String
    player: String
    playersInPlay: [String!]
  }
  type PlayerState {
    player: String!
    cardCount: Int!
  }
  type GameState {
    turnRotation: [String!]
    currentMove: CurrentMove!
    playerStates: [PlayerState]
  }
  type GameStartState {
    cards: [Card!]!
    gameState: GameState!
  }
`;

export type Card = {
  id: number;
  value: number;
  suit: number;
};

export interface GameState {
  turnRotation: Types.ObjectId[];
  currentMove: {
    cards: Card[];
    play: string;
    player: Types.ObjectId;
    playersInPlay: Types.ObjectId[];
  };
  playerStates: {
    player: Types.ObjectId;
    cardCount: number;
  }[];
}

export interface GameStateUpdateResult {
  updatedGameState: GameState;
  success: boolean;
}

export interface GameInput {
  name: string;
  roomName: string;
}

export type PlayerAction = {
  action: string;
  cardsPlayed: Card[];
};

export default typeDefs;
