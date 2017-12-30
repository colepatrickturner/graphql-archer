/* eslint no-console: 0 */
import chalk from 'chalk';

export const defaultTextProcessor = str => str;
export const processOutputArgs = (args, processor = defaultTextProcessor) => {
  return args.reduce((carry, value) => {
    const str = typeof value === 'string' ? value : JSON.stringify(value);
    const processedStr = processor(str);

    if (carry === '') {
      return processedStr;
    }
    return `${carry} ${processedStr}`;
  }, '');
};

export default function output(args, processor = defaultTextProcessor) {
  return console.info(processOutputArgs(['🏹  '].concat(args), processor));
}

export const createColoredOutput = colorer => {
  return (...str) => {
    output(str, colorer);
  };
};

export const info = createColoredOutput(chalk.white);
export const warn = createColoredOutput(chalk.yellow);
export const fail = createColoredOutput(chalk.red);
export const debug = createColoredOutput(chalk.yellow);
export const success = createColoredOutput(chalk.green);
export const printEmptyRow = () => console.info('');
