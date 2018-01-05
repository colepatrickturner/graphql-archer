import { writeFileSync } from 'fs';
import { writeIndex } from 'create-index';
import hasIndex from 'create-index/dist/utilities/hasIndex';
import mkdirp from 'mkdirp';
import chalk from 'chalk';
import path from 'path';
import { GraphQLObjectType, typeFromAST, parseType, printType } from 'graphql';
import {
  KEY,
  INQUIRE_TRY_AGAIN,
  TYPE_DIRECTORY,
  SCHEMA_FILE_NAME,
  RESOLVER_FILE_NAME,
  INQUIRE_REWRITE_INDEX,
} from './constants';
import {
  call,
  put,
  takeEvery,
  inquire,
  waitForAnswerTo,
} from 'graphql-archer/src/effects';
import {
  success,
  fail,
  info,
  printEmptyRow,
} from 'graphql-archer/src/lib/output';
import {
  ADD_SERVER_CHOICE,
  GENERATE_OBJECT,
} from 'graphql-archer-servers/constants';

const injectServerChoice = put({
  type: ADD_SERVER_CHOICE,
  name: 'Apollo Server',
  value: KEY,
  templateDir: path.resolve(path.join(__dirname, './template')),
  dependencies: {
    'apollo-server-express': '^1',
    'body-parser': '^1',
    'babel-cli': '^6',
    graphql: '^0.11.0',
    'graphql-tools': '^2',
    'graphql-import': '^0.1.5',
  },
  devDependencies: {
    'graphql-archer-apollo-server': '^1',
  },
  archerRC: {
    schemaPath: './src/schema/',
    plugins: ['apollo-server'],
  },
  middleware: [
    {
      name: 'graphql',
      enabled: true,
      priority: 20,
      route: '/graphql',
      module: {
        name: './lib/middleware/graphql',
        method: 'graphQLMiddleware',
        arguments: [],
      },
    },
    {
      name: 'graphiql',
      enabled: true,
      priority: 25,
      route: '/graphiql',
      module: {
        name: './lib/middleware/graphiql',
        method: 'graphIQLMiddleware',
        arguments: [{ endpointURL: '/graphiql' }],
      },
    },
  ],
});

export function createObjectType({ objectName: name, description, fields }) {
  // TODO: import existing schema
  const schema = null;

  return new GraphQLObjectType({
    name,
    fields: fields.reduce((obj, field) => {
      const { description, type } = field;
      return {
        ...obj,
        [field.name]: {
          description,
          type: typeFromAST(schema, parseType(type)),
        },
      };
    }, {}),
    description,
  });
}

export function* writeSchema({ schemaPath, objectName, description, fields }) {
  const relativeSchemaFile = path.join(
    schemaPath,
    TYPE_DIRECTORY,
    objectName,
    SCHEMA_FILE_NAME
  );

  yield call(
    success,
    `Generating object type ${chalk.magenta(objectName)} at ${chalk.magenta(
      relativeSchemaFile
    )}`
  );

  // Write the schema file
  while (true) {
    const schematic = yield call(createObjectType, {
      objectName,
      description,
      fields,
    });

    const schemaString = yield call(printType, schematic);

    try {
      writeFileSync(relativeSchemaFile, schemaString);
      break;
    } catch (e) {
      fail(`Unable to write to ${relativeSchemaFile}:\n${e.message}`);

      yield inquire(INQUIRE_TRY_AGAIN, {
        type: 'confirm',
        name: 'tryAgain',
        message: `Would you like to try again?`,
      });

      const { tryAgain } = yield waitForAnswerTo(INQUIRE_TRY_AGAIN);

      if (!tryAgain) {
        fail(`Cancelling - here's your schema definition:`);
        printEmptyRow();
        info(schemaString);

        break;
      }
    }
  }
}

export function* writeResolver({ schemaPath, objectName, fields }) {
  const relativeSchemaFile = path.join(
    schemaPath,
    TYPE_DIRECTORY,
    objectName,
    RESOLVER_FILE_NAME
  );

  yield call(
    success,
    `Generating object type ${chalk.magenta(objectName)} at ${chalk.magenta(
      relativeSchemaFile
    )}`
  );
}

export function* makeFolder({ schemaPath, objectName }) {
  const folderPath = path.join(schemaPath, TYPE_DIRECTORY, objectName);

  try {
    yield call(mkdirp.sync, path.resolve(folderPath));
  } catch (e) {
    fail(`Unable to create path to ${folderPath}:\n${e.message}`);
  }
}

export function* writeIndexFile({ schemaPath, objectName }) {
  const folderPath = path.join(schemaPath, TYPE_DIRECTORY, objectName);
  success(`Running create-index to make ${folderPath}/index.js`);

  if (hasIndex(folderPath)) {
    info(`An index already exists @ ${folderPath}`);
    yield inquire(INQUIRE_REWRITE_INDEX, {
      type: 'confirm',
      name: 'tryAgain',
      message: `Do you want to recreate the exports index?`,
    });

    const { tryAgain } = yield waitForAnswerTo(INQUIRE_REWRITE_INDEX);

    if (!tryAgain) {
      info(`OK - Skipping...`);
      printEmptyRow();
      return;
    }
  }

  yield call(writeIndex, [folderPath]);
}

const onObjectGeneration = takeEvery(GENERATE_OBJECT, function*(args) {
  // Make sure folder exists
  yield call(makeFolder, args);

  // Print schema
  yield call(writeSchema, args);

  // Add resolvers
  yield call(writeResolver, args);

  // Make sure type is modular
  yield call(writeIndexFile, args);

  yield call(success, 'Done!');
});

export default function*() {
  yield [injectServerChoice, onObjectGeneration];
}
