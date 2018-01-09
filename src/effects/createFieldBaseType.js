import chalk from 'chalk';
import inquire from './inquire';
import waitForAnswerTo from './waitForAnswerTo';
import { BASE_SCALARS } from '../lib/scalars';
import { QUESTION_FIELD_TYPE } from './fieldPicker';

export default function* getFieldBaseType({ fieldName, defaultType }) {
  // Sort scalars by whichever has the same value
  const sortedScalars = BASE_SCALARS.slice().map(scalar => {
    return {
      ...scalar,
      name: scalar.name === defaultType ? chalk.grey(scalar.name) : scalar.name,
    };
  });

  sortedScalars.sort((a, b) => {
    const x = a.value === defaultType;
    const y = b.value === defaultType;

    if (x === y) {
      return 0;
    }

    return x ? -1 : 1;
  });

  yield inquire(QUESTION_FIELD_TYPE, {
    type: 'autocomplete',
    message: chalk.yellow(
      `Choose the type kind for "${chalk.cyan(fieldName)}":`
    ),
    name: 'type',
    source: function(answersSoFar, input) {
      return new Promise(resolve => {
        resolve(
          sortedScalars.filter(
            ({ name }) =>
              !input || name.toLowerCase().includes(input.toLowerCase())
          )
        );
      });
    },
  });

  const { type } = yield waitForAnswerTo(QUESTION_FIELD_TYPE);
  return type;
}
