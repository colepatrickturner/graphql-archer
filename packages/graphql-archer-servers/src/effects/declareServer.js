import { put } from 'redux-saga/effects';

export const DECLARE_SERVER = Symbol();

export default server =>
  put({
    type: DECLARE_SERVER,
    ...server,
  });
