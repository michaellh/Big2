import ReactDOM from 'react-dom/client';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
  split,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import App from './App';

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('user-token');

  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : null,
    },
  };
});

const httpLink = createHttpLink({ uri: 'http://localhost:3001' });

const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:3001',
    connectionParams() {
      return {
        Authorization: localStorage.getItem('user-token')
          ? `Bearer ${localStorage.getItem('user-token')}`
          : null,
      };
    },
  }),
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink),
);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink,
  connectToDevTools: true,
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
);
