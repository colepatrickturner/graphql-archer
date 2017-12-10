import chalk from 'chalk';
import { success, fail } from '../../lib/output';
import { toFileSystemName, createProject } from '../../lib/util';
import * as Questions from '../../commands/create/questions';
import inquire from '../../effects/inquire';
import { put, waitForAnswerTo } from '../../effects';

export const QUESTION_PROJECT_NAME = Symbol();
export const QUESTION_IS_NAME_GOOD = Symbol();
export const SCAFFOLD_PROJECT = Symbol();

export default function* createProjectSaga(action) {
  let { name } = action;

  while (true) {
    // Require a name to continue
    if (!name) {
      yield inquire(QUESTION_PROJECT_NAME, Questions.name());
      const answer = yield waitForAnswerTo(QUESTION_PROJECT_NAME);
      name = answer.name;

      if (!name) {
        fail('You must specify a project name');
      }
      continue;
    }

    // Validate the name
    const formattedName = toFileSystemName(name);
    if (formattedName != name) {
      yield inquire(
        QUESTION_PROJECT_NAME,
        Questions.reformattedName(formattedName)
      );
      const { confirm } = yield waitForAnswerTo(QUESTION_PROJECT_NAME);
      if (confirm !== 'y') {
        name = false;
        continue;
      }

      name = formattedName;
    }

    // Kick off the creation event loop
    success(chalk.white('Creating project with name:'), name);

    try {
      const project = createProject(name);
      yield put({ type: SCAFFOLD_PROJECT, project });
    } catch (e) {
      fail(e.message);
    }

    break;
  }
}
