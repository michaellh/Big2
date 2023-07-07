import { Schema, Types, model } from 'mongoose';

interface ILobby {
  code: string;
  host: {
    type: Types.ObjectId;
    required: true;
  };
  players: [Types.ObjectId];
  gameState: Types.ObjectId;
}

const schema = new Schema<ILobby>(
  {
    code: String,
    host: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    players: [Schema.Types.ObjectId],
    gameState: Schema.Types.ObjectId,
  },
  { collection: 'lobby' },
);

const Lobby = model<ILobby>('Lobby', schema);

export default Lobby;
