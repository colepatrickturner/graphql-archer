import chalk from 'chalk';
import inquirer from 'inquirer';
import { success, fail } from '../../lib/output';
import { toFileSystemName, createProject } from '../../lib/Project';
import * as Questions from '../../lib/commands/create/questions';
import inquire, { QUESTION, ANSWER } from '../../lib/effects/inquire';
import { put, takeEvery, waitForAnswerTo } from '../../lib/effects';

export const QUESTION_PROJECT_NAME = Symbol();
export const QUESTION_IS_NAME_GOOD = Symbol();
export const CREATE_PROJECT = Symbol();
export const SCAFFOLD_PROJECT = Symbol();

export function* createProjectSaga(action) {
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

const inquiry = takeEvery('*', function*(action) {
  if (action.type === QUESTION) {
    const { id, queries } = action;
    const answer = yield inquirer.prompt(queries);

    yield put({
      type: ANSWER,
      id,
      answer,
    });
  }
});

export default function* projectSaga() {
  yield [takeEvery(CREATE_PROJECT, createProjectSaga), inquiry];
}
