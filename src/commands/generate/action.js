export const COMMAND_GENERATE_ENTITY = Symbol();
export default function({ program, store }) {
  program
    .command('generate [entity]')
    .alias('g')
    .description('generates a schema entity')
    .action(entity => {
      store.dispatch({ type: COMMAND_GENERATE_ENTITY, entity });
    });
}
