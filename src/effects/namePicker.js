import chalk from 'chalk';
import { inquire, waitForAnswerTo } from '../effects';

export const QUESTION_NAME = Symbol();

export default function* namePicker({
  message = 'Please enter a name...',
  formatter = n => n,
  getConfirmMessage = name => chalk.yellow(`Use name "${chalk.cyan(name)}"?`),
  ...otherProps
}) {
  let name = null;
  while (true) {
    if (!name) {
      yield inquire(QUESTION_NAME, {
        type: 'input',
        name: 'name',
        message,
        ...otherProps,
      });

      const answer = yield waitForAnswerTo(QUESTION_NAME);
      name = answer.name;
      continue;
    }

    if (!formatter) {
      return name;
    }

    // Validate the name
    const formattedName = formatter(name);
    if (!formattedName) {
      name = null;
      continue;
    }

    if (formattedName !== name) {
      yield inquire(QUESTION_NAME, {
        type: 'expand',
        message: getConfirmMessage(formattedName),
        name: 'confirm',
        default: 'y',
        choices: [
          {
            key: 'y',
            name: 'Yes',
            value: 'y',
          },
          {
            key: 'n',
            name: 'No, choose new name',
            value: 'n',
          },
        ],
      });

      const { confirm } = yield waitForAnswerTo(QUESTION_NAME);
      if (confirm !== 'y') {
        name = false;
        continue;
      }

      name = formattedName;
      if (!name) {
        continue;
      }
    }

    return name;
  }
}
