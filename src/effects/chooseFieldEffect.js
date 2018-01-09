import inquirer from 'inquirer';
import inquire from './inquire';
import waitForAnswerTo from './waitForAnswerTo';
export const QUESTION_ENTITY_OPTIONS = Symbol();

export default function* chooseFieldEffect({ fields }) {
  const additionalOptions = getAdditionalObjectOptions({ fields });

  // 3.b Display options
  yield inquire(QUESTION_ENTITY_OPTIONS, {
    type: 'list',
    message: 'Choose an option',
    name: 'option',
    choices: [
      {
        name: 'Add a field',
        value: OPERATION_ADD,
      },
      ...additionalOptions,
    ],
  });

  // 3.c Respond to option
  const { option } = yield waitForAnswerTo(QUESTION_ENTITY_OPTIONS);
  return option;
}

export function getAdditionalObjectOptions({ fields }) {
  if (!fields.length) {
    return ZERO_FIELD_OPTIONS;
  }

  return MULTIPLE_FIELD_OPTIONS;
}

export const OPERATION_ADD = 'a';
export const OPERATION_MODIFY = 'e';
export const OPERATION_REMOVE = 'r';
export const OPERATION_FINISH = 'f';
export const OPERATION_CANCEL = 'c';

const ZERO_FIELD_OPTIONS = [
  new inquirer.Separator(),
  {
    name: 'Cancel',
    value: OPERATION_CANCEL,
  },
];

const MULTIPLE_FIELD_OPTIONS = [
  {
    name: 'Modify a field',
    value: OPERATION_MODIFY,
  },
  {
    name: 'Remove a field',
    value: OPERATION_REMOVE,
  },
  new inquirer.Separator(),
  {
    name: 'Finish',
    value: OPERATION_FINISH,
  },
];
