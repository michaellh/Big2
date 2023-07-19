/* eslint-disable no-console */
import express from 'express';
import cors from 'cors';
import http from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import {
  typeDefs as scalarTypeDefs,
  resolvers as scalarResolvers,
} from 'graphql-scalars';
import path from 'path';
import config from './utils/config';
import typeDefs from './schema';
import resolvers from './resolvers';
import scheduler, { cleanUpJob } from './utils/cleanup-scheduler';

const start = async () => {
  mongoose.set('strictQuery', false);
  console.log('Attempting to connect to mongoDB');
  try {
    await mongoose.connect(config.MONGODB_URI);
  } catch (err) {
    throw new Error(`Connecting to mongoDB failed: ${err}`);
  }

  const app = express();
  const rootRouter = express.Router();
  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/',
  });

  const schema = makeExecutableSchema({
    typeDefs: [...scalarTypeDefs, typeDefs],
    resolvers: [scalarResolvers, resolvers],
  });

  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx) => {
        const auth =
          typeof ctx.connectionParams?.Authorization === 'string'
            ? ctx.connectionParams.Authorization
            : null;
        if (auth && auth.startsWith('Bearer ')) {
          const token = auth.substring(7);
          try {
            const userId = jwt.verify(token, config.JWT_SECRET);
            return { userId };
          } catch (error) {
            console.error('Token verification failed:', error);
          }
        }

        return {};
      },
    },
    wsServer,
  );

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  if (process.env.NODE_ENV === 'production') {
    const frontendBuildPath = path.join(__dirname, 'build');

    app.use(
      '/',
      cors(),
      express.json(),
      express.static(frontendBuildPath),
      rootRouter.get('*', (_req, res) => {
        res.sendFile(path.join(frontendBuildPath, 'index.html'));
      }),
      expressMiddleware(server, {
        context: async ({ req }) => {
          const auth = req ? req.headers.authorization : null;
          if (auth && auth.startsWith('Bearer ')) {
            const token = auth.substring(7);

            try {
              const userId = jwt.verify(token, config.JWT_SECRET);

              return { userId };
            } catch (error) {
              console.error('Token verification failed:', error);
            }
          }

          return {};
        },
      }),
    );
  } else {
    app.use(
      '/',
      cors(),
      express.json(),
      expressMiddleware(server, {
        context: async ({ req }) => {
          const auth = req ? req.headers.authorization : null;
          if (auth && auth.startsWith('Bearer ')) {
            const token = auth.substring(7);

            try {
              const userId = jwt.verify(token, config.JWT_SECRET);

              return { userId };
            } catch (error) {
              console.error('Token verification failed:', error);
            }
          }

          return {};
        },
      }),
    );
  }

  scheduler.addSimpleIntervalJob(cleanUpJob);

  httpServer.listen(config.PORT, () =>
    console.log(`Server is now running on http://localhost:${config.PORT}`),
  );
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
start();
