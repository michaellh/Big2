import { config } from 'dotenv';

const result = config();

if (result.error) {
  throw result.error;
}

const PORT: number = Number(process.env.PORT);
const JWT_SECRET: string = process.env.JWT_SECRET || 'tobi_my_dog';
const MONGODB_URI: string = process.env.MONGODB_URI || '';

export default {
  PORT,
  JWT_SECRET,
  MONGODB_URI,
};
