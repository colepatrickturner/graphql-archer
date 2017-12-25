import chalk from 'chalk';
import {
  select,
  inquire,
  call,
  waitForAnswerTo,
} from 'graphql-archer/src/effects';
import { success, fail } from 'graphql-archer/src/lib/output';
import { inProject } from 'graphql-archer/src/lib/util';
import { QUESTION_ENTITY_TYPE, ENTITY_TYPES } from '../constants';
import { getGraphqlServerOptions } from '../util';
import chooseServer from './chooseServer';
import * as entityGenerators from './entities';


export default function* generateEntitySaga(action) {
  let { server, entity } = action;
  if (!inProject()) {
    return fail('No .archerrc detected - this is likely not a project folder.');
  }

  const choices = yield select(getGraphqlServerOptions);
  if (!choices.length) {
    return fail('No server plugins detected - cannot continue.');
  } else if (choices.length === 1) {
    server = choices[0];
    success(`Using server plugin: ${server.name}`);
  }

  while (true) {
    // Require a server choice to continue
    if (!server) {
      server = yield call(chooseServer);

      if (server) {
        success(`Using server plugin: ${server.name}`);
      }
      continue;
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

    yield entityGenerators[entity]();

    break;
  }
}