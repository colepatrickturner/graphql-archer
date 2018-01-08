export function extractResolvers(typeModules) {
  return Object.keys(typeModules).reduce((carry, name) => {
    if ('resolvers' in typeModules[name]) {
      return {
        ...carry,
        [name]: typeModules[name].resolvers,
      };
    }

    return carry;
  }, {});
}
