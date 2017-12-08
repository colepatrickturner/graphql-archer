import program from 'commander';
import packageJSON from '../package.json';
import { registerCommands } from './lib/commands';

const { version } = packageJSON;

registerCommands(program)
  .version(version)
  .parse(process.argv); // eslint-disable-line

if (!program.args.length) {
  program.outputHelp();
}
