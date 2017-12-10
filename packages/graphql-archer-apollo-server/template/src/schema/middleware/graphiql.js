import { graphiqlExpress } from 'apollo-server-express';

export default function(config) {
  return graphiqlExpress(config);
}