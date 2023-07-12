import { Schema, Types, model } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
}

const schema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { collection: 'user' },
);

const UserModel = model<IUser>('User', schema);

export default UserModel;
