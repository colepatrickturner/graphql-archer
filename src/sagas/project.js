import createProjectSaga from '../commands/create/saga';
import { COMMAND_CREATE_PROJECT } from '../commands/create/action';
import { takeEvery } from 'redux-saga/effects';

export default function* projectSaga() {
  yield [takeEvery(COMMAND_CREATE_PROJECT, createProjectSaga)];
}
