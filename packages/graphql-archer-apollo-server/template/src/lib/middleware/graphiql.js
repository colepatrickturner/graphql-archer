
import { graphiqlExpress } from 'apollo-server-express';

export function graphIQLMiddleware({ endpointURL }) {
  return graphiqlExpress({ endpointURL });
}