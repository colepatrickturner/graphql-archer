import chalk from 'chalk';
import inquire from './inquire';
import waitForAnswerTo from './waitForAnswerTo';

export const QUESTION_ENTITY_DESCRIPTION = Symbol();
export default function* createDescription({ name, defaultValue }) {
  while (true) {
    yield inquire(QUESTION_ENTITY_DESCRIPTION, {
      default: defaultValue,
      type: 'input',
      message: chalk.yellow(`Please describe "${chalk.white(name)}"...`),
      name: 'description',
    });

    const { description } = yield waitForAnswerTo(QUESTION_ENTITY_DESCRIPTION);
    if (!description) {
      continue;
    }

    return description;
  }
}
