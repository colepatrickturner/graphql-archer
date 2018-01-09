import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { success, fail } from 'graphql-archer/src/lib/output';
import {
  updateJSONFile,
  addPackageObjects,
  deepMerge,
} from 'graphql-archer/src/lib/util';

export function getGraphqlServerOptions(state) {
  return state['graphql-archer-servers'].servers;
}

export function scaffoldServer(
  { name: projectName, cwd },
  {
    name: serverName,
    archerRC,
    dependencies,
    devDependencies,
    templateDir,
    middleware,
  }
) {
  const middlewareConfigFile = path.resolve(
    path.join(cwd, 'config/middleware.json')
  );
  const packageJSONFile = path.resolve(path.join(cwd, 'package.json'));
  const archerRCFile = path.resolve(path.join(cwd, '.archerrc'));

  // Copy files
  if (templateDir) {
    const templatePath = path.resolve(templateDir);
    fs.copySync(templatePath, cwd);
    success(`Copied ${serverName} files to ${chalk.magenta(cwd)}`);
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

  if (typeof archerRC === 'object') {
    updateJSONFile(archerRCFile, json => {
      return deepMerge(json, archerRC);
    });
  }

  success(`Finished!
    ${chalk.yellow('# 1. To initialize your project do the following:')}
    ${chalk.white(`cd ${projectName}`)}

    ${chalk.grey('# 2. Install using your favorite package manager:')}
    ${chalk.white(`npm install`)}
    ${chalk.white(`yarn install`)}

    ${chalk.grey('# 3. Start generating your schema:')}
    ${chalk.white(`graphql-archer generate`)}
  `);
}
