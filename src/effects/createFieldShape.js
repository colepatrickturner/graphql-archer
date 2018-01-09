import chalk from 'chalk';
import call from './index';
import createFieldBaseType from './createFieldBaseType';
import inquire from './inquire';
import waitForAnswerTo from './waitForAnswerTo';
import { getTruthySorter } from '../lib/util';
import { QUESTION_FIELD_TYPE } from './fieldPicker';

export default function* createFieldShape({
  fieldName,
  defaultType,
  defaultShape,
}) {
  const type = yield createFieldBaseType({ fieldName, defaultType });

  const sortedFieldTypes = [
    {
      name: `${type} (singular: nullable)`,
      value: type,
    },
    {
      name: `${type}! (singular: non-nullable)`,
      value: `${type}!`,
    },
    {
      name: `[${type}] (list: nullable, members: nullable)`,
      value: `[${type}]`,
    },
    {
      name: `[${type}]! (list: non-nullable, members: nullable)`,
      value: `[${type}]!`,
    },
    {
      name: `[${type}!]! (list: non-nullable, members: non-nullable)`,
      value: `[${type}!]!`,
    },
  ].sort(getTruthySorter(defaultType));

  yield inquire(QUESTION_FIELD_TYPE, {
    type: 'list',
    message: chalk.yellow(
      `Choose the type kind for "${chalk.cyan(fieldName)}":`
    ),
    name: 'choice',
    choices: sortedFieldTypes.map(t => {
      return {
        ...t,
        name: t.value === defaultShape ? chalk.grey(t.value) : t.name,
      };
    }),
  });

  let { choice } = yield waitForAnswerTo(QUESTION_FIELD_TYPE);

  return choice;
}
