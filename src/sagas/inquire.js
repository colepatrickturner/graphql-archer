import inquirer from 'inquirer';
import { put, takeEvery } from 'redux-saga/effects';
import { QUESTION, ANSWER } from '../effects/inquire';
inquirer.registerPrompt(
  'autocomplete',
  require('inquirer-autocomplete-prompt')
);

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
