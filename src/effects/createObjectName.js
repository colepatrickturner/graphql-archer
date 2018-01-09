import chalk from 'chalk';
import namePicker from './namePicker';
import { toGraphQLTypeName } from '../lib/util';

export default function createObjectName() {
  return namePicker({
    message: chalk.yellow(`Name your ${chalk.bold('Object Type')}...`),
    formatter: toGraphQLTypeName,
  });
}
