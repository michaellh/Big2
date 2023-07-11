export type User = {
  name: string;
};

export type GameInput = {
  name: string;
  roomName: string;
};

export type GameOutput = {
  lobbyId: string;
  token: string;
};

export type Card = {
  id: number;
  value: number;
  suit: number;
};

export type CardInput = {
  id: number;
  value: number;
  suit: number;
};

export type CurrentMove = {
  cards: Card[];
  play: string;
  player: string;
  playersInPlay: string[];
};

export type PlayerState = {
  player: string;
  cardCount: number;
  placementRank: number;
};

export interface GameState {
  turnRotation: string[];
  currentMove: CurrentMove;
  playerStates: PlayerState[];
  nextPlacementRank: number;
}

export interface GameStateUpdateResult {
  updatedGameState: GameState;
  success: boolean;
}

export type PlayerAction = {
  action: string;
  cardsPlayed: Card[];
};

export type GameStartState = {
  cards: Card[];
  gameState: GameState;
};
