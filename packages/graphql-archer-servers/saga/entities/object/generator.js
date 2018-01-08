import inquirer from 'inquirer';
import chalk from 'chalk';
import turtler from 'turtler';
import { parse as parseGraphQL } from 'graphql';
import {
  call,
  put,
  inquire,
  namePicker,
  waitForAnswerTo,
} from 'graphql-archer/src/effects';
import {
  toGraphQLTypeName,
  toGraphQLFieldName,
  getGraphQLBaseType,
  getTruthySorter,
} from 'graphql-archer/src/lib/util';
import {
  QUESTION_ENTITY_DESCRIPTION,
  QUESTION_ENTITY_OPTIONS,
  QUESTION_FIELD_TYPE,
  CONFIRM_FIELD_REMOVAL,
  SCALARS,
  GENERATE_OBJECT,
} from '../../../constants';
import {
  info,
  fail,
  success,
  printEmptyRow,
} from 'graphql-archer/src/lib/output';

export default function* objectGenerator({ schema, schemaPath }) {
  let objectName = false;
  let description = false;
  // TODO - Load existing schema, if exists
  let fields = [];

  // 1. Check if name is set
  while (!objectName) {
    objectName = yield getName();
    continue;
  }

  // 2. Check if description is set
  while (!description) {
    description = yield getDescription({ name: objectName });
  }

  // 3. Manage schema
  while (true) {
    // 3.a Print the current schema
    yield printSchema(objectName, fields);

    const additionalOptions = getAdditionalObjectOptions({ fields });

    // 3.b Display options
    yield inquire(QUESTION_ENTITY_OPTIONS, {
      type: 'list',
      message: 'Choose an option',
      name: 'option',
      choices: [
        {
          name: 'Add a field',
          value: ADD,
        },
        ...additionalOptions,
      ],
    });

    // 3.c Respond to option
    const { option } = yield waitForAnswerTo(QUESTION_ENTITY_OPTIONS);
    fields = yield reduceFieldState(fields, { option, objectName });

    // 3.d Save, if finished
    if (doesActionSaveFields({ option })) {
      yield put({
        type: GENERATE_OBJECT,
        schema,
        objectName,
        description,
        fields,
        schemaPath,
      });
    }

    // 3.e Exit, if cancelling or finished
    if (doesActionCancel({ option })) {
      if (!fields.length) {
        info('OK, cancelling generator...');
      }
      break;
    }
  }
}

export function getName() {
  return namePicker({
    message: chalk.yellow(`Name your ${chalk.bold('Object Type')}...`),
    formatter: toGraphQLTypeName,
  });
}

export function* getDescription({ name, defaultValue }) {
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

export function getTitleRow(title, columns = 10) {
  if (title.length > columns) {
    const fullWidth = chalk.grey(' '.repeat(columns));
    return `${fullWidth}\n${chalk.white(title)}\n${fullWidth}`;
  }

  const bookEndLength = Math.max(5, Math.floor(columns / 2) - title.length - 2);
  const bookEnd = chalk.grey(' '.repeat(bookEndLength));
  return `${bookEnd} ${chalk.white(title)} ${bookEnd}`;
}

export function* printSchema(name, fields) {
  const maxColumns = Math.max(5, Math.round(process.stdout.columns / 3));
  const separator = chalk.grey('='.repeat(maxColumns));

  const titleRow = chalk.green(`Object: ${name}`);

  printEmptyRow();

  if (fields.length) {
    const fieldsTable = turtler(
      [
        ['field', 'type', 'description'].map(s => chalk.yellow(s)),
        ...fields.map(field => {
          const { name, type, description } = field;
          return [
            chalk.magenta(name),
            chalk.white(type),
            chalk.grey(description),
          ];
        }),
      ],
      {
        hasHeader: true,
        columnSeperator: ' | ',
        headerSeperator: '=',
      }
    );

    yield call(info, `${titleRow}\n${separator}\n${chalk.grey(fieldsTable)}`);
  } else {
    yield call(
      info,
      `${titleRow}\n${separator}\n${chalk.grey('(no fields)')}\n${separator}`
    );
  }
}

export function getFieldName({ objectName, defaultValue }) {
  return namePicker({
    default: defaultValue,
    message: chalk.yellow(
      `${chalk.cyan(`${objectName} >`)} Name your ${chalk.bold('Field')}...`
    ),
    formatter: toGraphQLFieldName,
  });
}

export function* getFieldType({ fieldName, defaultValue }) {
  // Sort scalars by whichever has the same value
  const sortedScalars = SCALARS.slice().map(scalar => {
    return {
      ...scalar,
      name:
        scalar.name === defaultValue ? chalk.grey(defaultValue) : scalar.name,
    };
  });

  sortedScalars.sort((a, b) => {
    const x = a.value === defaultValue;
    const y = b.value === defaultValue;

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

export function* getFullyQualifiedFieldType({ fieldName, type, defaultValue }) {
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
  ].sort(getTruthySorter(defaultValue));

  yield inquire(QUESTION_FIELD_TYPE, {
    type: 'list',
    message: chalk.yellow(
      `Choose the type kind for "${chalk.cyan(fieldName)}":`
    ),
    name: 'choice',
    choices: sortedFieldTypes.map(t => {
      return {
        ...t,
        name: t.value === defaultValue ? chalk.grey(defaultValue) : t.name,
      };
    }),
  });

  let { choice } = yield waitForAnswerTo(QUESTION_FIELD_TYPE);

  return choice;
}

const ADD = 'a';
const MODIFY = 'e';
const REMOVE = 'r';
const FINISH = 'f';
const CANCEL = 'c';

export function* reduceAddField(fields, { objectName }) {
  const field = {};

  while (!field.name) {
    field.name = yield getFieldName({ objectName });
    if (fields.find(f => f.name == field.name)) {
      fail('A field already exists by that name...');
      field.name = null;
    }
  }

  const baseType = yield getFieldType({ fieldName: field.name });
  field.type = yield getFullyQualifiedFieldType({
    fieldName: field.name,
    type: baseType,
  });
  field.description = yield getDescription({ name: field.name });

  success(`Added field ${field.name}`);

  return fields.concat(field);
}

export function* fieldPicker(fields) {
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

export function* reduceRemoveField(fields) {
  const fieldName = yield fieldPicker(fields);
  if (fieldName) {
    yield inquire(CONFIRM_FIELD_REMOVAL, {
      type: 'confirm',
      name: 'confirm',
      message: `Are you sure you want to remove "${chalk.magenta(fieldName)}"?`,
    });

    const { confirm } = yield waitForAnswerTo(CONFIRM_FIELD_REMOVAL);

    if (confirm) {
      success(`Removed field ${fieldName}`);
      return fields.filter(({ name }) => name !== fieldName);
    }
  }

  return fields;
}

export function getFieldByName(fields, name) {
  return fields.find(field => field.name.toLowerCase() === name.toLowerCase());
}

export function* reduceModifyField(fields, { objectName }) {
  const field = {};
  const fieldName = yield fieldPicker(fields);
  const existingField = getFieldByName(fields, fieldName);

  if (fieldName) {
    while (!field.name) {
      field.name = yield getFieldName({ objectName, defaultValue: fieldName });
      if (field.name != fieldName && fields.find(f => f.name == field.name)) {
        fail('A field already exists by that name...');
        field.name = null;
      }
    }
  }

  const parsedNode = parseGraphQL(
    `type Hello { world: ${existingField.type} }`
  );
  const fieldType = getGraphQLBaseType(
    parsedNode.definitions[0].fields[0].type
  );

  const fieldTypeStr = fieldType.name.value;

  const baseType = yield getFieldType({
    fieldName: field.name,
    defaultValue: fieldTypeStr,
  });

  field.type = yield getFullyQualifiedFieldType({
    defaultValue: existingField.type,
    fieldName: field.name,
    type: baseType,
  });

  field.description = yield getDescription({
    name: field.name,
    defaultValue: existingField.description,
  });

  return fields.map(f => (f === existingField ? field : f));
}

export function* reduceFieldState(fields, { objectName, option }) {
  const state = fields.slice();

  switch (option) {
    case ADD:
      return yield reduceAddField(state, { objectName });

    case REMOVE:
      return yield reduceRemoveField(state);

    case MODIFY:
      return yield reduceModifyField(state, { objectName });
  }

  return state;
}

const ZERO_FIELD_OPTIONS = [
  new inquirer.Separator(),
  {
    name: 'Cancel',
    value: CANCEL,
  },
];

const MULTIPLE_FIELD_OPTIONS = [
  {
    name: 'Modify a field',
    value: MODIFY,
  },
  {
    name: 'Remove a field',
    value: REMOVE,
  },
  new inquirer.Separator(),
  {
    name: 'Finish',
    value: FINISH,
  },
];

export function getAdditionalObjectOptions({ fields }) {
  if (!fields.length) {
    return ZERO_FIELD_OPTIONS;
  }

  return MULTIPLE_FIELD_OPTIONS;
}

export function doesActionSaveFields({ option }) {
  return option === FINISH;
}

export function doesActionCancel({ option }) {
  return [FINISH, CANCEL].includes(option);
}
