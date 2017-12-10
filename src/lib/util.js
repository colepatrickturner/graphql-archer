import shush from 'shush';
import chalk from 'chalk';
import path from 'path';
import { fail } from './output';
import packageJSON from '../../package.json';
import fs from 'fs-extra';
import mkdirp from 'mkdirp';
import { success } from '../lib/output';

const { name, version } = packageJSON;

const settings = parseRCFile(path.join(__dirname, '../../.archerrc'));

export function parseRCFile(fileName) {
  return shush(fileName);
}

export const getPluginSagasObject = () => getPluginPropertiesObject('saga');
export const getPluginReducersObject = () =>
  getPluginPropertiesObject('reducer');

export function getPluginPropertiesObject(prop) {
  const { plugins = [] } = settings;
  return plugins.reduce((map, plugin) => {
    const pluginName = `${name}-${plugin}`;
    try {
      const module = require(pluginName);

      if (!(prop in module)) {
        return map;
      }

      map[pluginName] = module[prop];
      return map;
    } catch (e) {
      fail(
        `Unable to import plugin ${chalk.bgWhite(` ${pluginName} `)}`,
        e.message
      );
      fail(e.stack);
      return map;
    }
  }, {});
}

export function getPackageVersion() {
  return version;
}

export function getPackageName() {
  return name;
}

export function toFileSystemName(name) {
  return name.replace(/[^a-zA-Z0-9-]/g, '');
}

export function createProject(name) {
  const cwd = path.resolve(`./${name}`);
  if (fs.existsSync(cwd)) {
    throw new Error(`Path ${cwd} already exists, aborting...`);
  }

  // Make our project folder
  mkdirp(cwd);

  // Copy our root template
  const templatePath = path.resolve(path.join(__dirname), '../../template/');
  fs.copySync(templatePath, cwd);
  success(`Copied base project to ${cwd}`);

  return {
    name,
    cwd,
  };
}
