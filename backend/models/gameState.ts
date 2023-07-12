import { Schema, model } from 'mongoose';

interface ICard {
  id: number;
  value: number;
  suit: number;
}

interface ICurrentMove {
  cards: ICard[];
  play: string;
  player: string;
  playersInPlay: string[];
}

interface IPlayerState {
  player: string;
  cardCount: number;
  placementRank: number;
}

interface IGameState {
  turnRotation: string[];
  currentMove: ICurrentMove;
  playerStates: IPlayerState[];
  nextPlacementRank: number;
}

const schema = new Schema<IGameState>(
  {
    turnRotation: [String],
    currentMove: {
      cards: [
        {
          id: Number,
          value: Number,
          suit: Number,
        },
      ],
      play: String,
      player: String,
      playersInPlay: [String],
    },
    playerStates: [
      {
        player: String,
        cardCount: Number,
        placementRank: Number,
      },
    ],
    nextPlacementRank: Number,
  },
  { collection: 'gameState' },
);

const GameStateModel = model<IGameState>('GameState', schema);

export default GameStateModel;
