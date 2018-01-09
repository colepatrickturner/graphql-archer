import chalk from 'chalk';
import inquire from './inquire';
import waitForAnswerTo from './waitForAnswerTo';

export const QUESTION_FIELD_TYPE = Symbol();

export default function* fieldPicker(fields) {
  yield inquire(QUESTION_FIELD_TYPE, {
    type: 'list',
    message: chalk.yellow(`Choose field:`),
    name: 'type',
    choices: fields.map(({ name, type }) => ({
      name: `${name} ${chalk.grey(`(${type})`)}`,
      value: name,
    })),
  });

  const { type } = yield waitForAnswerTo(QUESTION_FIELD_TYPE);
  return type;
}
