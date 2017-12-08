
import inquirer from 'inquirer';
import { success, fail } from '../output';


export function createProject(name) {
  success('Creating project with name:', name);
}

const nameQuestion = {
  type: 'input',
  name: 'name',
  message: 'Please enter a name...',
};

export default function (program) {
  program
    .command('create [name]')
    .description('creates a project by name')
    .action((name, options) => {
      if (name) {
        return createProject(name);
      }

      inquirer.prompt([nameQuestion]).then(({ name: answer }) => {
        if (answer) {
          return createProject(answer);
        }

        return fail('You must specify a project name');
      });
    });

}