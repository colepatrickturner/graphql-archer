import chalk from 'chalk';
import { success, fail } from '../../lib/output';
import { toFileSystemName, createProject } from '../../lib/util';
import namePicker from '../../effects/namePicker';
import scaffoldProject from '../../effects/scaffoldProject';

export const QUESTION_PROJECT_NAME = Symbol();
export const QUESTION_IS_NAME_GOOD = Symbol();

export default function* createProjectSaga(action) {
  let { name } = action;

  while (true) {
    if (!name) {
      name = yield namePicker({
        formatter: toFileSystemName,
      });
    }

    // Kick off the creation event loop
    success(chalk.white('Creating project with name:'), name);

    try {
      const project = createProject(name);
      yield scaffoldProject(project);
    } catch (e) {
      fail(e.message);
    }

    break;
  }
}
