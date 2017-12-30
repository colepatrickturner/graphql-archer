export const CHOOSE_SERVER = Symbol();
export const ADD_SERVER_CHOICE = Symbol();
export const QUESTION_ENTITY_TYPE = Symbol();
export const QUESTION_ENTITY_DESCRIPTION = Symbol();
export const QUESTION_ENTITY_OPTIONS = Symbol();
export const QUESTION_FIELD_TYPE = Symbol();
export const CONFIRM_FIELD_REMOVAL = Symbol();

export const ENTITY_TYPES = Object.freeze({
  object: 'Object Type',
  input: 'Input Type',
  mutation: 'Mutation Type',
  scalar: 'Scalar',
});

export const SCALARS = [
  { name: 'String', value: 'String' },
  { name: 'Integer', value: 'Integer' },
  { name: 'Boolean', value: 'Boolean' },
  { name: 'Float', value: 'Float' },
  { name: 'ID', value: 'ID' },
];