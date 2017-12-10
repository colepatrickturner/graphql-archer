import { makeExecutableSchema } from 'graphql-tools';

import typeDefs from './types/root.graphql';
import resolvers from './types/resolvers';
export default makeExecutableSchema({ typeDefs, resolvers });