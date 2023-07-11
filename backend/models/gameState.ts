import { Schema, Types, model } from 'mongoose';

interface ICard {
  id: number;
  value: number;
  suit: number;
}

interface ICurrentMove {
  cards: ICard[];
  play: string;
  player: Types.ObjectId;
  playersInPlay: Types.ObjectId[];
}

interface IPlayerState {
  player: Types.ObjectId;
  cardCount: number;
  placementRank: number;
}

interface IGameState {
  turnRotation: Types.ObjectId[];
  currentMove: ICurrentMove;
  playerStates: IPlayerState[];
  nextPlacementRank: number;
}

const schema = new Schema<IGameState>(
  {
    turnRotation: {
      type: [Schema.Types.ObjectId],
      required: true,
    },
    currentMove: {
      cards: [
        {
          id: Number,
          value: Number,
          suit: Number,
        },
      ],
      play: String,
      player: Schema.Types.ObjectId,
      playersInPlay: {
        type: [Schema.Types.ObjectId],
        required: true,
      },
    },
    playerStates: [
      {
        player: Schema.Types.ObjectId,
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
