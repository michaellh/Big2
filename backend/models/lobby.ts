import { Schema, Types, model } from 'mongoose';

interface ILobby {
  code: string;
  host: Types.ObjectId;
  players: Types.ObjectId[];
  gameState: Types.ObjectId;
}

const schema = new Schema<ILobby>(
  {
    code: String,
    host: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    players: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    gameState: {
      type: Schema.Types.ObjectId,
      ref: 'GameState',
    },
  },
  { collection: 'lobby' },
);

const LobbyModel = model<ILobby>('Lobby', schema);

export default LobbyModel;
