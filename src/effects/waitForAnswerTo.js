import { call, take } from 'redux-saga/effects';
import { ANSWER } from './inquire';

export default function waitForAnswerTo(id) {
  return call(function*() {
    while (true) {
      const action = yield take(ANSWER);
      if (action.id === id) {
        return yield action.answer;
      }
    }
  });
}
