import path from 'path';
import { makeExecutableSchema } from 'graphql-tools';
import { importSchema } from 'graphql-import';

import resolvers from './types/resolvers';
const typeDefs = importSchema(
  path.resolve(path.join(__dirname, './types/schema.graphql'))
);

export default makeExecutableSchema({ typeDefs, resolvers });
