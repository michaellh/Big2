import { Schema, Types, model } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  last_active: Date;
}

const schema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    last_active: Date,
  },
  { collection: 'user' },
);

const UserModel = model<IUser>('User', schema);

export default UserModel;
