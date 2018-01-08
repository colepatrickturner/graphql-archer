import chalk from 'chalk';
import {
  select,
  inquire,
  call,
  waitForAnswerTo,
  tryAgain,
} from 'graphql-archer/src/effects';
import { success, fail } from 'graphql-archer/src/lib/output';
import { inProject, getSchemaPath } from 'graphql-archer/src/lib/util';
import { QUESTION_ENTITY_TYPE, ENTITY_TYPES } from '../constants';
import { getGraphqlServerOptions } from '../util';
import { chooseServer } from './chooseServer';
import * as entityGenerators from './entities';

export async function getSchema(server, schemaPath) {
  const importer = require(`${server.value}/getSchema`);
  return importer(schemaPath);
}

export default function* generateEntitySaga(action) {
  let { server, entity } = action;
  let schema;

  const schemaPath = yield call(getSchemaPath);
  const announceServer = ({ name }) =>
    success(`${chalk.grey('Using server plugin:')} ${name}`);

  if (!inProject()) {
    return fail('No .archerrc detected - this is likely not a project folder.');
  }

  const choices = yield select(getGraphqlServerOptions);
  if (!choices.length) {
    return fail('No server plugins detected - cannot continue.');
  } else if (choices.length === 1) {
    server = choices[0];
    announceServer(server);
  }

  while (true) {
    // Require a server choice to continue
    if (!server) {
      server = yield call(chooseServer);

      if (server) {
        success(`Using server plugin: ${server.name}`);
        announceServer(server);
      }
      continue;
    }

    if (!schema) {
      try {
        schema = yield call(server.getSchema, schemaPath);
      } catch (e) {
        fail('Unable to import schema...');

        if (
          e.stack.includes('babel-register') &&
          e.message.includes('.babelrc')
        ) {
          fail(`Reason: ${e.message}`);
          fail(`Please make sure your project's node modules are installed.`);
        } else {
          fail(e.stack);
        }

        const confirmed = yield tryAgain();
        if (confirmed) {
          continue;
        } else {
          break;
        }
      }
    }

    // Require an entity type to continue
    if (!entity) {
      yield inquire(QUESTION_ENTITY_TYPE, {
        type: 'list',
        message: chalk.yellow(`Please select one:`),
        name: 'entity',
        choices: Object.keys(ENTITY_TYPES).map(value => {
          return {
            name: ENTITY_TYPES[value],
            value,
          };
        }),
      });

      const answer = yield waitForAnswerTo(QUESTION_ENTITY_TYPE);
      entity = answer.entity;

      if (!entity) {
        fail('You must choose an entity type');
      }

      continue;
    }

    if (!(entity in entityGenerators)) {
      return fail(`Unable to find generator "${entity}"`);
    }

    yield call(entityGenerators[entity], { schema, schemaPath });

    break;
  }
}
