import path from 'path';
import { makeExecutableSchema } from 'graphql-tools';
import { importSchema } from 'graphql-import';
import { extractResolvers } from 'graphql-archer';

const typeDefs = importSchema(
  path.resolve(path.join(__dirname, './schema.graphql'))
);

import typeModules from './types';
const resolvers = extractResolvers(typeModules);

export default makeExecutableSchema({ typeDefs, resolvers });
