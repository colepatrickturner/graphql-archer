import { call, fork, takeEvery } from '../effects';
import { getPluginSagasObject } from '../lib/util';
import { debug } from '../lib/output';

import inquireSaga from './inquire';
import projectSaga from './project';

export default function* saga() {
  const pluginSagaObject = getPluginSagasObject();
  const sagas = [
    fork(projectSaga),
    fork(inquireSaga),
    ...Object.values(pluginSagaObject).map(saga => fork(saga)),
  ];

  if (process.env.DEBUG) {
    debug('Running plugin sagas', Object.keys(pluginSagaObject));
    sagas.push(
      takeEvery('*', function*(action) {
        yield call(debug, 'DEBUG ACTION', action); //eslint-disable-line
      })
    );
  }

  yield sagas;
}
