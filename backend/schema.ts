const typeDefs = `
  type Query {
    clientCount: Int!
    allClients: [String]!
  }
  type Mutation {
    addClient(name: String!): String! 
  }
  type Subscription {
    clientAdded: String!
  }
`;

export default typeDefs;
