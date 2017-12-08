import { call, put, takeEvery } from '../effects';
import { ANSWER } from './takeAnswer';
import inquirer from './inquirer';

const QUESTION = Symbol();

function inquire(id, queries) {
  return put({
    type: QUESTION,
    id,
    queries,
  });
}

export default (id, queries) => inquire(id, queries);

export function* saga() {
  yield takeEvery('*', function*(action) {
    if (action.type === QUESTION) {
      const { id, queries } = action;
      const answer = yield inquirer.prompt(queries);

      yield put({
        type: ANSWER,
        id,
        answer,
      });
    }
  });
}
