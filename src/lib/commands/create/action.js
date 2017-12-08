import chalk from 'chalk';
import inquirer from 'inquirer';
import instrument from '../../instrument';
import { success, fail } from '../../output';
import { toFileSystemName, createProject } from '../../Project';
import * as Questions from './questions';

export function onProjectNameInput(name) {
  const formattedName = toFileSystemName(name);
  if (formattedName === name) {
    success(chalk.white('Creating project with name:'), name);
    return instrument('before-create', name).then(effects => {
      createProject(name, effects);
    });
  }

  inquirer
    .prompt([Questions.reformattedName(formattedName)])
    .then(({ confirm }) => {
      if (confirm === undefined) {
        return;
      }

      if (confirm === 'y') {
        return createProject(formattedName);
      }

      return askForProjectName();
    });
}

export function askForProjectName() {
  inquirer.prompt([Questions.name()]).then(({ name: answer }) => {
    if (answer) {
      return onProjectNameInput(answer);
    }

    return fail('You must specify a project name');
  });
}

export default function(program) {
  program
    .command('create [name]')
    .description('creates a project by name')
    .action(name => {
      if (name) {
        return onProjectNameInput(name);
      }

      askForProjectName();
    });
}
