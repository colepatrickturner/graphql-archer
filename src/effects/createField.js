import createDescription from './createDescription';
import createFieldName from './createFieldName';
import createFieldShape from './createFieldShape';
import { fail, success } from '../lib/output';

export default function* createField(fields, { objectName }) {
  const field = {};

  while (!field.name) {
    field.name = yield createFieldName({ objectName });
    if (fields.find(f => f.name == field.name)) {
      fail('A field already exists by that name...');
      field.name = null;
    }
  }

  field.type = yield createFieldShape({
    fieldName: field.name,
  });
  field.description = yield createDescription({ name: field.name });

  success(`Added field ${field.name}`);

  return fields.concat(field);
}
