import { existsSync, readFileSync, writeFileSync } from 'fs';
import { writeIndex } from 'create-index';
import hasIndex from 'create-index/dist/utilities/hasIndex';
import mkdirp from 'mkdirp';
import chalk from 'chalk';
import path from 'path';
import { GraphQLObjectType, typeFromAST, parseType, printType } from 'graphql';
import {
  KEY,
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
  tryAgain,
} from 'graphql-archer/src/effects';
import {
  success,
  fail,
  info,
  printEmptyRow,
  debug,
} from 'graphql-archer/src/lib/output';
import { getDependencyPackageVersion } from 'graphql-archer/src/lib/util';
import {
  ADD_SERVER_CHOICE,
  GENERATE_OBJECT,
} from 'graphql-archer-servers/constants';
import getSchema from './getSchema';

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
    'graphql-archer-apollo-server': getDependencyPackageVersion(
      'graphql-archer-apollo-server'
    ),
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
  getSchema,
});

export function* createObjectType({
  schema,
  objectName: name,
  description,
  fields,
}) {
  return yield new GraphQLObjectType({
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

export function* getObjectSDL({ schema, objectName, description, fields }) {
  while (true) {
    try {
      const schematic = yield call(createObjectType, {
        schema,
        objectName,
        description,
        fields,
      });

      return yield call(printType, schematic);
    } catch (e) {
      fail(`Unable to create object type, because:\n${e.message}`);
      const confirmed = yield tryAgain();

      if (!confirmed) {
        fail(`Cancelling - here's your blue print:`);
        printEmptyRow();
        info(JSON.stringify({ objectName, description, fields }, null, true));

        break;
      }
    }
  }
}

export function* writeSchema(
  folderPath,
  { schema, objectName, description, fields }
) {
  const relativeSchemaFile = path.join(folderPath, SCHEMA_FILE_NAME);

  yield call(
    success,
    `Generating type definition for ${chalk.magenta(
      objectName
    )} at ${chalk.magenta(relativeSchemaFile)}`
  );

  // Write the schema file
  while (true) {
    const schemaString = yield call(getObjectSDL, {
      schema,
      objectName,
      description,
      fields,
    });

    try {
      writeFileSync(relativeSchemaFile, schemaString);
      break;
    } catch (e) {
      fail(`Unable to write to ${relativeSchemaFile}:\n${e.message}`);

      const confirmed = yield tryAgain();

      if (!confirmed) {
        fail(`Cancelling - here's your schema definition:`);
        printEmptyRow();
        info(schemaString);

        break;
      }
    }
  }
}

export function getFunctionForField(field) {
  const args = 'obj, args, context, info';
  const blockComment = '// resolve this field';
  const directFunctionNameSyntax = `function ${
    field.name
  }(${args}) {\r\n${blockComment}\r\n}`;

  try {
    eval(directFunctionNameSyntax);
    return `export ${directFunctionNameSyntax}`;
  } catch (e) {
    debug(
      `The following syntax failed to evaluate:\r\n${directFunctionNameSyntax}`
    );
  }

  return `/*\r\n${directFunctionNameSyntax}\r\n*/`;
}

export function* writeResolver(folderPath, { objectName, fields }) {
  const relativeSchemaFile = path.join(folderPath, RESOLVER_FILE_NAME);

  yield call(
    success,
    `Generating resolvers for ${chalk.magenta(objectName)} at ${chalk.magenta(
      relativeSchemaFile
    )}`
  );

  // Write the module's resolvers file
  const source = existsSync(relativeSchemaFile)
    ? readFileSync(relativeSchemaFile)
    : '';
  let updatedSource = fields.reduce((source, field) => {
    return `${source}\r\n\r\n${getFunctionForField(field)}`;
  }, source);

  updatedSource += `\r\n\r\n
export default function() {
  return {
    ${fields.map(f => f.name).join(`,\r\n    `)}
  };
}`;

  writeFileSync(relativeSchemaFile, updatedSource);

  // Update the schema/resolvers.js file
  // IDEA: field orchestration?
}

export function* makeFolder({ schemaPath, objectName }) {
  let folderPath = null;
  let suffix = '';

  while (!folderPath) {
    folderPath = path.join(
      schemaPath,
      TYPE_DIRECTORY,
      `${objectName}${suffix}`
    );
    yield folderPath;

    if (existsSync(folderPath)) {
      fail(`Path already exists: ${folderPath}`);
      folderPath = null;
      suffix = `_${new Date().getTime()}`;
    }
  }

  try {
    yield call(mkdirp.sync, path.resolve(folderPath));
    success(`Created path at ${chalk.magenta(folderPath)}`);
  } catch (e) {
    fail(`Unable to create path to ${folderPath}:\n${e.message}`);
  }

  return folderPath;
}

export function* writeIndexFile(folderPath) {
  success(`Generating exports at ${chalk.magenta(`${folderPath}/index.js`)}`);

  if (hasIndex(folderPath)) {
    info(`An index already exists @ ${folderPath}`);
    yield inquire(INQUIRE_REWRITE_INDEX, {
      type: 'confirm',
      name: 'proceed',
      message: `Do you want to recreate the exports index?`,
    });

    const { proceed } = yield waitForAnswerTo(INQUIRE_REWRITE_INDEX);

    if (!proceed) {
      info(`OK - Skipping...`);
      printEmptyRow();
      return;
    }
  }

  yield call(writeIndex, [folderPath]);
}

const onObjectGeneration = takeEvery(GENERATE_OBJECT, function*(args) {
  // Make sure folder exists
  const basePath = yield call(makeFolder, args);

  // Print schema
  yield call(writeSchema, basePath, args);

  // Add resolvers
  yield call(writeResolver, basePath, args);

  // Make sure type is modular
  yield call(writeIndexFile, basePath);

  yield call(success, 'Done!');
});

export default function*() {
  yield [injectServerChoice, onObjectGeneration];
}
