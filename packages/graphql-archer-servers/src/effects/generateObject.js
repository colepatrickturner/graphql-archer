import { put } from 'redux-saga/effects';
export const GENERATE_OBJECT = Symbol('GENERATE OBJECT');

export default object =>
  put({
    type: GENERATE_OBJECT,
    ...object,
  });
