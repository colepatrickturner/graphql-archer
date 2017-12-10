export const COMMAND_CREATE_PROJECT = Symbol();
export default function({ program, store }) {
  program
    .command('create [name]')
    .description('creates a project by name')
    .action(name => {
      store.dispatch({ type: COMMAND_CREATE_PROJECT, name });
    });
}
