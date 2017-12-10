import shush from 'shush';
import chalk from 'chalk';
import path from 'path';
import { fail } from './output';
import packageJSON from '../../package.json';
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
