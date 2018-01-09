import chalk from 'chalk';
import turtler from 'turtler';
import { call } from 'redux-saga/effects';
import { printEmptyRow, info } from 'graphql-archer/src/lib/output';

export function getTitleRow(title, columns = 10) {
  if (title.length > columns) {
    const fullWidth = chalk.grey(' '.repeat(columns));
    return `${fullWidth}\n${chalk.white(title)}\n${fullWidth}`;
  }

  const bookEndLength = Math.max(5, Math.floor(columns / 2) - title.length - 2);
  const bookEnd = chalk.grey(' '.repeat(bookEndLength));
  return `${bookEnd} ${chalk.white(title)} ${bookEnd}`;
}

export default function* printSchema(name, fields) {
  const maxColumns = Math.max(5, Math.round(process.stdout.columns / 3));
  const separator = chalk.grey('='.repeat(maxColumns));

  const titleRow = chalk.green(`Object: ${name}`);

  printEmptyRow();

  if (fields.length) {
    const fieldsTable = turtler(
      [
        ['field', 'type', 'description'].map(s => chalk.yellow(s)),
        ...fields.map(field => {
          const { name, type, description } = field;
          return [
            chalk.magenta(name),
            chalk.white(type),
            chalk.grey(description),
          ];
        }),
      ],
      {
        hasHeader: true,
        columnSeperator: ' | ',
        headerSeperator: '=',
      }
    );

    yield call(info, `${titleRow}\n${separator}\n${chalk.grey(fieldsTable)}`);
  } else {
    yield call(
      info,
      `${titleRow}\n${separator}\n${chalk.grey('(no fields)')}\n${separator}`
    );
  }
}
