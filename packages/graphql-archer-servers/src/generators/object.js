import {
  createObjectName,
  createDescription,
  printSchema,
  switchFieldOptions,
} from 'graphql-archer/src/effects';
import { info, fail } from 'graphql-archer/src/lib/output';
import generateObject from '../effects/generateObject';

export default function* objectGenerator({ schema, schemaPath }) {
  let objectName = null;
  let description = null;
  // TODO - Load existing schema, if exists
  let fields = [];
  let isFinished, isCancelled;

  // 1. Check if name is set
  while (!objectName) {
    objectName = yield createObjectName();

    // prevent duplicates
    if (schema.getType(objectName)) {
      fail('A type already exists by that name, please choose a new name...');
      objectName = null;
    }

    continue;
  }

  // 2. Is description set?
  while (!description) {
    description = yield createDescription({ name: objectName });
  }

  // 3. Manage schema
  while (true) {
    // 3.a Print the current schema
    yield printSchema(objectName, fields);

    // 3.b do something
    ({ fields, isFinished, isCancelled } = yield switchFieldOptions({
      fields,
      objectName,
    }));

    if (isFinished) {
      yield generateObject({
        schema,
        objectName,
        description,
        fields,
        schemaPath,
      });
    }

    // 3.e Exit, if cancelling or finished
    if (isCancelled) {
      if (!isFinished) {
        info('OK, cancelling generator...');
      }

      break;
    }
  }
}
