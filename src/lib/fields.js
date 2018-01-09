import toCamelCase from 'camelcase';

export function getFieldByName(fields, name) {
  return fields.find(field => field.name.toLowerCase() === name.toLowerCase());
}

export function toGraphQLFieldName(str) {
  return toCamelCase(str.replace(/[^a-zA-Z0-9]/g, ''));
}
