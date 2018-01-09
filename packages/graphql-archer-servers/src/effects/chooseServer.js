import { inquire, waitForAnswerTo } from 'graphql-archer/src/effects';
import getServerOptions from './getServerOptions';

export const CHOOSE_SERVER = Symbol();

export function* chooseServer(
  { message } = { message: 'Choose a GraphQL Server:' }
) {
  const choices = yield getServerOptions();
  yield inquire(CHOOSE_SERVER, {
    type: 'list',
    message,
    name: 'choice',
    choices: choices,
  });

  const { choice } = yield waitForAnswerTo(CHOOSE_SERVER);
  return choices.find(option => option.value === choice);
}
