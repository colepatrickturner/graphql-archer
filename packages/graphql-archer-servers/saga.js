import fs from 'fs-extra';
import path from 'path';
import { CHOOSE_SERVER } from './constants';
import {
  takeEvery,
  select,
  inquire,
  waitForAnswerTo,
} from 'graphql-archer/src/effects';
import { SCAFFOLD_PROJECT } from 'graphql-archer/src/commands/create/saga';
import { success } from 'graphql-archer/src/lib/output';

function getGraphqlServerOptions(state) {
  return state['graphql-archer-servers'].servers;
}

function scaffoldProject({ cwd }, { name, templateDir }) {
  if (templateDir) {
    const templatePath = path.resolve(templateDir);
    fs.copySync(templatePath, cwd);
    success(`Copied ${name} files to ${cwd}`);
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
