import { COMMAND_GENERATE_ENTITY } from 'graphql-archer/src/commands/generate/action';
import { takeEvery } from 'redux-saga/effects';
import chooseEntityGenerator from './src/effects/chooseEntityGenerator';
import scaffoldServer from './src/effects/scaffoldServer';
import { SCAFFOLD_PROJECT } from 'graphql-archer/src/effects/scaffoldProject';

export default function*() {
  yield [
    takeEvery(SCAFFOLD_PROJECT, scaffoldServer),
    takeEvery(COMMAND_GENERATE_ENTITY, chooseEntityGenerator),
  ];
}
