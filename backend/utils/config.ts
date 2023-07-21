import { config } from 'dotenv';

const result = config();

if (result.error) {
  throw result.error;
}

const PORT =
  process.env.NODE_ENV === 'production'
    ? Number(process.env.PORT_PROD)
    : Number(process.env.PORT_DEV);
const JWT_SECRET: string = process.env.JWT_SECRET || 'tobi_my_dog';
const MONGODB_URI: string =
  process.env.NODE_ENV === 'production'
    ? process.env.MONGODB_URI_PROD || ''
    : process.env.MONGODB_URI_DEV_TEST || '';

export default {
  PORT,
  JWT_SECRET,
  MONGODB_URI,
};
