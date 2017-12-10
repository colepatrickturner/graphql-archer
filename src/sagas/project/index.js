import createProjectSaga from './create';
import { COMMAND_CREATE_PROJECT } from '../../commands/create/action';
import { takeEvery } from '../../effects';

export default function* projectSaga() {
  yield [takeEvery(COMMAND_CREATE_PROJECT, createProjectSaga)];
}
