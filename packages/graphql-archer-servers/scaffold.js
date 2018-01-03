import chalk from 'chalk';
import path from 'path';
import { put } from 'graphql-archer/lib/effects';
import { success } from 'graphql-archer/lib/output';
import { GENERATE_OBJECT } from './constants';

export default function* scaffoldObjectType({ basePath, objectName, fields }) {

  const resolvedBasePath = path.resolve(basePath);

  yield put({
    type: GENERATE_OBJECT,
    objectName,
    fields,
    basePath,
    resolvedBasePath
  });
}
