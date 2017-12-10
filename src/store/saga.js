import { getPluginSagasObject } from '../lib/Archer';
import { fork } from '../lib/effects';
import projectSaga from './sagas/project';
import { call, takeEvery } from '../lib/effects';
import { debug } from '../lib/output';

export default function sagaFactory(program) {
  return function* saga() {
    const pluginSagaObject = getPluginSagasObject();
    const sagas = [
      fork(projectSaga),
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
  };
}
