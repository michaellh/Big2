import express from "express";
import cors from "cors";
import http from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import {
  typeDefs as scalarTypeDefs,
  resolvers as scalarResolvers,
} from "graphql-scalars";
import config from "./utils/config";
import typeDefs from "./schema";
import resolvers from "./resolvers";

const start = async () => {
  const app = express();
  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/",
  });

  const schema = makeExecutableSchema({
    typeDefs: [...scalarTypeDefs, typeDefs],
    resolvers: [scalarResolvers, resolvers],
  });
  const serverCleanup = useServer({ schema }, wsServer);

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

  app.use(
    "/",
    cors(),
    express.json(),
    expressMiddleware(server, {
      //   context: async ({ req }) => {
      //     const auth = req ? req.headers.authorization : null;
      //     if (auth && auth.startsWith("Bearer ")) {
      //       const decodedToken = jwt.verify(
      //         auth.substring(7),
      //         process.env.JWT_SECRET
      //       );
      //       const currentUser = await User.findById(decodedToken.id).populate(
      //         "friends"
      //       );
      //       return { currentUser };
      //     }
      //   },
    })
  );

  httpServer.listen(config.PORT, () =>
    console.log(`Server is now running on http://localhost:${config.PORT}`)
  );
};

start();
