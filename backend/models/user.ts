import { Schema, model } from 'mongoose';

interface IUser {
  name: string;
}

const schema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { collection: 'user' }
);

const User = model<IUser>('User', schema);

export default User;
