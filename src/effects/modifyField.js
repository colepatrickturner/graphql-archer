import fieldPicker from './fieldPicker';
import createDescription from './createDescription';
import createFieldName from './createFieldName';
import createFieldShape from './createFieldShape';
import { parse as parseGraphQL } from 'graphql';
import { getFieldByName } from '../lib/fields';
import { getGraphQLBaseType } from '../lib/types';
import { fail } from '../lib/output';

export default function* modifyField(fields, { objectName }) {
  const field = {};
  const fieldName = yield fieldPicker(fields);
  const existingField = getFieldByName(fields, fieldName);

  if (fieldName) {
    while (!field.name) {
      field.name = yield createFieldName({
        objectName,
        defaultValue: fieldName,
      });
      if (field.name != fieldName && fields.find(f => f.name == field.name)) {
        fail('A field already exists by that name...');
        field.name = null;
      }
    }
  }

  const parsedNode = parseGraphQL(
    `type Hello { world: ${existingField.type} }`
  );
  const fieldType = getGraphQLBaseType(
    parsedNode.definitions[0].fields[0].type
  );

  const fieldTypeStr = fieldType.name.value;

  field.type = yield createFieldShape({
    defaultType: fieldTypeStr,
    defaultShape: existingField.type,
    fieldName: field.name,
  });

  field.description = yield createDescription({
    name: field.name,
    defaultValue: existingField.description,
  });

  return fields.map(f => (f === existingField ? field : f));
}
