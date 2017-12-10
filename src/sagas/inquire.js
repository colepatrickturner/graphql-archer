import inquirer from 'inquirer';
import { put, takeEvery } from '../effects';
import { QUESTION, ANSWER } from '../effects/inquire';

export default function* projectSaga() {
  yield [
    takeEvery('*', function*(action) {
      if (action.type === QUESTION) {
        const { id, queries } = action;
        const answer = yield inquirer.prompt(queries);

        yield put({
          type: ANSWER,
          id,
          answer,
        });
      }
    }),
  ];
}
