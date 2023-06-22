import { config } from "dotenv";

const result = config();

if (result.error) {
  throw result.error;
}

const PORT: number = Number(process.env.PORT);

export default {
  PORT,
};
