import ReactDOM from 'react-dom/client';
import ApolloLinkTimeout from 'apollo-link-timeout';
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
import './styles.css';
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

const timeoutLink = new ApolloLinkTimeout(7000);
const { hostname } = window.location;
const backendPort = process.env.NODE_ENV === 'production' ? 80 : 3001;
const httpLink = createHttpLink({ uri: `http://${hostname}:${backendPort}` });
const timeoutHttpLink = timeoutLink.concat(httpLink);

const wsLink = new GraphQLWsLink(
  createClient({
    url: `ws://${hostname}:${backendPort}`,
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
  authLink.concat(timeoutHttpLink),
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
