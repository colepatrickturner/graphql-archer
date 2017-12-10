import { CREATE_PROJECT } from '../../../store/sagas/project';

export default function({ program, store }) {
  program
    .command('create [name]')
    .description('creates a project by name')
    .action(name => {
      store.dispatch({ type: CREATE_PROJECT, name });
    });
}
