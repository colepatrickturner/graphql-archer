import takeEvery from '../../lib/effects';
import question from '../../lib/effects/question';
import instrument from '../../lib/effects/instrument';
import { BEFORE_CREATE } from '../../lib/instrument';
import { ANSWER } from '../../lib/effects/takeAnswer';

export function* askQuestion(archer) {
  const plugins = yield plugins();
  const choices = [];
  for (let plugin of plugins) {
    const values = yield instrument(plugin);
    values.forEach(choices.push);
  }

  yield question(CHOOSE_SERVER, {
    type: 'list',
    message: `Choose a GraphQL Server:`,
    name: 'confirm',
    choices: choices,
  });
}

export default function*(archer) {
  yield takeEvery(BEFORE_CREATE, askQuestion);
}

export function takeServerChoice(generator) {
  // Implement a channel here where sagas can talk to each other without actions
  return takeEvery(CHOOSE_SERVER, generator);
}

export const CHOOSE_SERVER = Symbol();
