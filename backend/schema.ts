const typeDefs = `
  type Query {
    allClients: [String]!
  }
  type Mutation {
    joinGame(name: String!): String! 
    startGame: Void
    playerMove(playerAction: PlayerAction!): GameState!
  }
  type Subscription {
    gameStart(name: String!): GameStartState!
    playerMove: GameState!
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
    name: String!
    action: String!
    cardsPlayed: [CardInput!]!
  }
  type CurrentMove {
    cards: [Card!]
    type: String!
    player: String!
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

export type GameState = {
  turnRotation: string[];
  currentMove: {
    cards: Card[];
    type: string;
    player: string;
    playersInPlay: string[];
  };
  playerStates: {
    player: string;
    cardCount: number;
  }[];
};

export interface GameStateUpdateResult {
  updatedGameState: GameState;
  success: boolean;
}

export type PlayerAction = {
  name: string;
  action: string;
  cardsPlayed: Card[];
};

export default typeDefs;
