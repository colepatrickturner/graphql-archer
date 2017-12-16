import path from 'path';
import { put } from 'graphql-archer/src/effects';
import { ADD_SERVER_CHOICE } from 'graphql-archer-servers/constants';

const injectServerChoice = put({
  type: ADD_SERVER_CHOICE,
  name: 'Apollo Server',
  value: 'apollo',
  templateDir: path.resolve(path.join(__dirname, './template')),
  dependencies: {
    'apollo-server-express': '^1',
    'body-parser': '^1',
    graphql: '^0.11.0',
    'graphql-tools': '^2',
    'graphql-import': '^0.1.5'
  },
  middleware: [
    {
      name: 'graphql',
      enabled: true,
      priority: 20,
      route: '/graphql',
      module: {
        name: './lib/middleware/graphql',
        method: 'graphQLMiddleware',
        arguments: [],
      },
    },
    {
      name: 'graphiql',
      enabled: true,
      priority: 25,
      route: '/graphiql',
      module: {
        name: './lib/middleware/graphiql',
        method: 'graphIQLMiddleware',
        arguments: [{ endpointURL: '/graphiql' }],
      },
    },
  ],
});

export default function*() {
  yield [injectServerChoice];
}
