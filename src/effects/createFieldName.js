import chalk from 'chalk';
import { namePicker } from 'graphql-archer/src/effects';
import { toGraphQLFieldName } from '../lib/fields';

export default function createFieldName({ objectName, defaultValue }) {
  return namePicker({
    default: defaultValue,
    message: chalk.yellow(
      `${chalk.cyan(`${objectName} >`)} Name your ${chalk.bold('Field')}...`
    ),
    formatter: toGraphQLFieldName,
  });
}
