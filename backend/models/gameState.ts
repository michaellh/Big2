import { Schema, model, Types } from 'mongoose';

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

export interface IPlayerState {
  player: string;
  cards: ICard[];
  placementRank: number;
}

export interface IGameState {
  _id: Types.ObjectId;
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
        cards: [
          {
            id: Number,
            value: Number,
            suit: Number,
          },
        ],
        placementRank: Number,
      },
    ],
    nextPlacementRank: Number,
  },
  { collection: 'gameState' },
);

const GameStateModel = model<IGameState>('GameState', schema);

export default GameStateModel;
