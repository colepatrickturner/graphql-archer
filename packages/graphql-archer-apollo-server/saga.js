import path from 'path';
import { put } from 'graphql-archer/src/effects';
import { ADD_SERVER_CHOICE } from 'graphql-archer-servers/constants';

const injectServerChoice = put({
  type: ADD_SERVER_CHOICE,
  name: 'Apollo Server',
  value: 'apollo',
  templateDir: path.resolve(path.join(__dirname, './template'))
});

export default function*() {
  yield [
    injectServerChoice
  ];
}
