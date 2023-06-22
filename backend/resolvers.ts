// const { GraphQLError } = require("graphql");
// const jwt = require("jsonwebtoken");
import { PubSub } from "graphql-subscriptions";
import { clients } from "./utils/test_data";

const pubsub = new PubSub();

const resolvers = {
  Query: {
    clientCount: () => clients.length,
    allClients: () => clients,
  },
  Mutation: {
    addClient: (_root: unknown, args: { name: string }) => {
      clients.push(args.name);
      pubsub.publish("CLIENT_ADDED", { clientAdded: args.name });

      return args.name;
    },
  },
  Subscription: {
    clientAdded: {
      subscribe: () => pubsub.asyncIterator("CLIENT_ADDED"),
    },
  },
};

export default resolvers;
