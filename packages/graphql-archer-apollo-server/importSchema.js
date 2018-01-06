import path from 'path';
import { fail } from 'graphql-archer/src/lib/output';

export default function importSchema(schemaPath) {
  try {
    return require(path.join(process.cwd(), schemaPath, 'index.js'));
  } catch (e) {
    if (e.stack.includes('babel-register') && e.message.includes('.babelrc')) {
      fail('Please install node modules before continuing...');
    } else {
      fail(e.message);
      fail(e.stack);
    }

    throw e;
  }
}
