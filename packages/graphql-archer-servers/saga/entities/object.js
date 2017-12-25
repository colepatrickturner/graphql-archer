import inquirer from 'inquirer';
import chalk from 'chalk';
import turtler from 'turtler';
import {
  call,
  inquire,
  namePicker,
  waitForAnswerTo,
} from 'graphql-archer/src/effects';
import {
  toGraphQLTypeName,
  toGraphQLFieldName,
} from 'graphql-archer/src/lib/util';
import {
  QUESTION_ENTITY_DESCRIPTION,
  QUESTION_ENTITY_OPTIONS,
  QUESTION_FIELD_TYPE,
} from '../../constants';
import { info, fail } from 'graphql-archer/src/lib/output';

export function getName() {
  return namePicker({
    message: chalk.yellow(`Name your ${chalk.bold('Object Type')}...`),
    formatter: toGraphQLTypeName,
  });
}

export function* getDescription(name) {
  yield inquire(QUESTION_ENTITY_DESCRIPTION, {
    type: 'input',
    message: chalk.yellow(`Please describe "${chalk.white(name)}"...`),
    name: 'description',
  });

  const { description } = yield waitForAnswerTo(QUESTION_ENTITY_DESCRIPTION);
  return description;
}

export function* printSchema(name, fields) {
  if (fields.length) {
    const fieldsTable = turtler(
      [
        ['field', 'type', 'description'].map(s => chalk.cyan(s)),
        ...fields.map(field => {
          const { name, type, description } = field;
          return [
            chalk.yellow(name),
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

    yield call(
      info,
      `${chalk.cyan(name)} ${chalk.grey('(Object)')}\n${chalk.cyan(
        fieldsTable
      )}`
    );
  } else {
    yield call(
      info,
      `${chalk.cyan(name)} ${chalk.grey('(Object)')}\n${chalk.cyan(
        'Fields: (none)'
      )}`
    );
  }
}

export function getFieldName(objectName) {
  return namePicker({
    message: chalk.yellow(
      `${chalk.cyan(`${objectName} >`)} Name your ${chalk.bold('Field')}...`
    ),
    formatter: toGraphQLFieldName,
  });
}

export function* getFieldType(fieldName) {
  yield inquire(QUESTION_FIELD_TYPE, {
    type: 'autocomplete',
    message: chalk.yellow(
      `Choose the type kind for "${chalk.cyan(fieldName)}":`
    ),
    name: 'type',
    source: function(answersSoFar, input) {
      return new Promise(resolve => {
        resolve(
          [
            { name: 'String', value: 'String' },
            { name: 'Integer', value: 'Integer' },
            { name: 'Boolean', value: 'Boolean' },
            { name: 'Float', value: 'Float' },
            { name: 'ID', value: 'ID' },
            { name: '* MyCustomType', value: 'MyCustomType' },
          ].filter(
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

export function* getFullyQualifiedFieldType(fieldName, type) {
  yield inquire(QUESTION_FIELD_TYPE, {
    type: 'list',
    message: chalk.yellow(
      `Choose the type kind for "${chalk.cyan(fieldName)}":`
    ),
    name: 'choice',
    choices: [
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
    ],
  });

  let { choice } = yield waitForAnswerTo(QUESTION_FIELD_TYPE);

  return choice;
}

export default function* objectGenerator() {
  let name = false;
  let description = false;
  let fields = [];

  // Check if name is set
  while (!name) {
    name = yield getName();
    continue;
  }

  // Check if description is set
  while (!description) {
    description = yield getDescription(name);
  }

  // Manage schema
  while (true) {
    // Print the current schema
    yield printSchema(name, fields);

    const ADD = 'a';
    const MODIFY = 'e';
    const REMOVE = 'r';
    const FINISH = 'f';
    yield inquire(QUESTION_ENTITY_OPTIONS, {
      type: 'rawlist',
      message: 'Choose an option',
      name: 'option',
      choices: [
        {
          name: 'Add a field',
          value: ADD,
        },
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
      ],
    });

    const { option } = yield waitForAnswerTo(QUESTION_ENTITY_OPTIONS);

    if (option === FINISH) {
      break;
    } else if (option === ADD) {
      const field = {};

      while (!field.name) {
        field.name = yield getFieldName(name);
        if (fields.find(f => f.name == field.name)) {
          fail('A field already exists by that name...');
          field.name = null;
        }
      }

      const baseType = yield getFieldType(field.name);
      field.type = yield getFullyQualifiedFieldType(field.name, baseType);
      field.description = yield getDescription(field.name);

      fields.push(field);
    } else if (option === REMOVE) {
    } else if (option === MODIFY) {
    }
  }
}

objectGenerator.displayName = 'Object Type';
