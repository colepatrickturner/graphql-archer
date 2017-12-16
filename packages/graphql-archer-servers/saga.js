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
import { updateJSONFile } from '../../src/lib/util';

function getGraphqlServerOptions(state) {
  return state['graphql-archer-servers'].servers;
}

function scaffoldProject(
  { cwd },
  { name, dependencies, devDependencies, templateDir, middleware }
) {
  const middlewareConfigFile = path.resolve(
    path.join(cwd, 'config/middleware.json')
  );
  const packageJSONFile = path.resolve(path.join(cwd, 'package.json'));

  // Copy files
  if (templateDir) {
    const templatePath = path.resolve(templateDir);
    fs.copySync(templatePath, cwd);
    success(`Copied ${name} files to ${cwd}`);
  }

  // Install middleware configuration
  if (Array.isArray(middleware) && middleware.length) {
    success(`Installing middleware: ${middleware.map(m => m.name).join(', ')}`);
    updateJSONFile(middlewareConfigFile, json => {
      const middlewareAsObject = middleware.reduce((carry, def) => {
        const { name, ...config } = def;
        let workingName = name;

        while (workingName in json) {
          workingName = `${name}${new Date().getTime()}`;
        }

        return {
          ...carry,
          [workingName]: config,
        };
      }, {});

      return {
        ...json,
        ...middlewareAsObject,
      };
    });
  }

  // Install dependencies
  addPackageObjects(packageJSONFile, { dependencies, devDependencies });
  const packageNames = [dependencies, devDependencies]
    .filter(Boolean)
    .map(Object.keys)
    .reduce((a, b) => a.concat(b));
  success(`Adding packages: ${packageNames.join(', ')}`);
}

export function addPackageObjects(packageJSONFile, objects) {
  updateJSONFile(packageJSONFile, json => {
    const data = { ...json };
    Object.keys(objects).forEach(key => {
      data[key] = {
        ...data[key],
        ...objects[key],
      };
    });

    return data;
  });
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
