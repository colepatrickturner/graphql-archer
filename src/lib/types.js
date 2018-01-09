export function getGraphQLBaseType(type) {
  if ('type' in type) {
    return getGraphQLBaseType(type.type);
  }

  return type;
}
