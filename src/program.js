import program from 'commander';
import storeFactory from './store';
import storage from 'node-persist';
import { registerCommands } from './commands';
import { getPackageVersion } from './lib/util';

const store = storeFactory(program);

function run() {
  registerCommands({ program, storage, store })
    .option('-d, --debug', 'Enable debug info')
    .version(getPackageVersion())
    .parse(process.argv); // eslint-disable-line

  if (!program.args.length) {
    program.outputHelp();
  }
}

storage.init().then(run);
