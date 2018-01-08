import path from 'path';
import { debug } from 'graphql-archer/src/lib/output';
import { GraphQLSchema, GraphQLObjectType } from 'graphql';

export default function getSchema(schemaPath) {
  // Try importing an executable schema
  try {
    return getExecutableSchema(schemaPath);
  } catch (e) {
    debug('Unable to import executable schema, using mock schema instead...');
    return new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {},
      }),
    });
  }
}

export function getExecutableSchema(schemaPath) {
  return require(path.join(process.cwd(), schemaPath, 'index.js'));
}
