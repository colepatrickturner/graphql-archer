import program from 'commander';
import storeFactory from './store';
import storage from 'node-persist';
import { registerCommands } from './commands';
import { getPackageVersion } from './lib/util';
import { SIGINT } from 'constants';

const store = storeFactory(program);

if (process.argv.includes('--debug')) {
  process.env.DEBUG = '*';
}

function run() {
  registerCommands({ program, storage, store })
    .option('-d, --debug', 'Enable debug info')
    .version(getPackageVersion())
    .parse(process.argv); // eslint-disable-line

  if (!program.args.length) {
    program.outputHelp();
  }

  process.on('SIGINT', () => {
    store.dispatch({ type: SIGINT });
  });
}

storage.init().then(run);
