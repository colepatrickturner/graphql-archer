import {
  select,
  inquire,
  put,
  call,
  waitForAnswerTo,
} from 'graphql-archer/src/effects';
import { CHOOSE_SERVER } from '../constants';
import { getGraphqlServerOptions, scaffoldServer } from '../util';


export default function* chooseServer({ message = 'Choose a GraphQL Server:' }) {
  const choices = yield select(getGraphqlServerOptions);
  yield inquire(CHOOSE_SERVER, {
    type: 'list',
    message,
    name: 'choice',
    choices: choices,
  });

  const choice = yield waitForAnswerTo(CHOOSE_SERVER);
  return yield choices.find(option => option.value === choice);
}

export function* askQuestion({ project }) {
  while (true) {
    const choice = yield call(chooseServer);
    if (!choice) {
      continue;
    }

    scaffoldServer(project, choice);

    yield put({
      type: CHOOSE_SERVER,
      choice,
    });

    break;
  }
}