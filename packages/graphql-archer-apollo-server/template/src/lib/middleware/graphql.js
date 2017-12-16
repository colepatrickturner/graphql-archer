
import bodyParser from 'body-parser';
import { graphqlExpress } from 'apollo-server-express';
import schema from '../../schema';

export function getMiddleware() {
  return graphqlExpress({ schema });
}

export function graphQLMiddleware() {
  return function graphql(req, res, next, ...rest) {
    bodyParser.json()(req, res, getMiddleware(), ...rest);
    next();
  };
}