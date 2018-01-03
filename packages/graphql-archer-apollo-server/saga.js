import chalk from 'chalk';
import path from 'path';
import { call, put, takeEvery } from 'graphql-archer/src/effects';
import { success } from 'graphql-archer/src/output';
import {
  ADD_SERVER_CHOICE,
  GENERATE_OBJECT,
} from 'graphql-archer-servers/constants';

const KEY = 'apollo-server';

const injectServerChoice = put({
  type: ADD_SERVER_CHOICE,
  name: 'Apollo Server',
  value: KEY,
  templateDir: path.resolve(path.join(__dirname, './template')),
  dependencies: {
    'apollo-server-express': '^1',
    'body-parser': '^1',
    'babel-cli': '^6',
    graphql: '^0.11.0',
    'graphql-tools': '^2',
    'graphql-import': '^0.1.5',
  },
  devDependencies: {
    'graphql-archer-apollo-server': '^1',
  },
  archerRC: {
    schemaPath: './src/schema/',
    plugins: ['apollo-server'],
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

const onObjectGeneration = takeEvery(GENERATE_OBJECT, function*({
  objectName,
  fields,
  basePath,
  resolvedTypePath
}) {
  const schemaFile = `${objectName}/schema.graphql`;
  const resolverFile = `${objectName}/resolvers.js`;
  
  yield call(success, (
    `Generating object type ${chalk.magenta(objectName)} at ${chalk.magenta(
      path.join(basePath, schemaFile)
    )}`
  ));

  // TODO: figure this out
  // Write direct to schema file, overwrite if present
  // But how to solve for resolvers? sticky problem
  // - A) use AST parsing
  // - B) couragiously append function to existing file
  // - C) Some kind of mergetool fallback?


});

export default function*() {
  yield [injectServerChoice, onObjectGeneration];
}
