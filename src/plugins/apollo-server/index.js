import { all } from '../../lib/effects';
import { CHOOSE_SERVER, takeServerChoice } from '../graphql-servers/plugin';

export default function*(archer) {
  yield all([
    takeServerChoice(function*() {
      yield {
        name: 'Apollo Server',
        value: 'apollo',
      };
    }),
  ]);
}
