import { put } from 'redux-saga/effects';
export const SCAFFOLD_PROJECT = Symbol();
export default project =>
  put({
    type: SCAFFOLD_PROJECT,
    project,
  });
