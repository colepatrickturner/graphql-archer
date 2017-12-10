import fs from 'fs-extra';
import path from 'path';
import { CHOOSE_SERVER } from './constants';
import { takeEvery, select } from '../../src/lib/effects';
import { inquire, waitForAnswerTo } from '../../src/lib/effects';
import { SCAFFOLD_PROJECT } from '../../src/store/sagas/project';
import { fail, success } from 'graphql-archer/src/lib/output';

function getGraphqlServerOptions(state) {
  return state['graphql-archer-servers'].servers;
}

function scaffoldProject({ cwd }, { name, templateDir }) {
  if (templateDir) {
    const templatePath = path.resolve(templateDir);
    fs.copy(templatePath, cwd, err => {
      if (err) {
        fail(err.message);
      }

      success(`Copied ${name} files to ${cwd}`);
    });
  }
}

export function* askQuestion({ project }) {
  const choices = yield select(getGraphqlServerOptions);

  while (true) {
    yield inquire(CHOOSE_SERVER, {
      type: 'list',
      message: `Choose a GraphQL Server:`,
      name: 'choice',
      choices: choices,
    });

    const { choice } = yield waitForAnswerTo(CHOOSE_SERVER);
    if (!choice) {
      continue;
    }

    const config = choices.find(option => option.value === choice);
    scaffoldProject(project, config);

    break;
  }
}

export default function*() {
  yield takeEvery(SCAFFOLD_PROJECT, askQuestion);
}
