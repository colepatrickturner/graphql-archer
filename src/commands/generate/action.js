import inquirer from 'inquirer';
export const COMMAND_GENERATE = Symbol();
export default function({ program, store }) {
  program
    .command('generate [entity]')
    .alias('g')
    .description('generates a schema entity')
    .action(entity => {
      inquirer.prompt([
        {
          type: 'list',
          message: `Please select one:`,
          name: 'choice',
          choices: [
            { name: 'Object Type', value: 'o' },
            { name: 'Input Type', value: 'o' },
            { name: 'Mutation Type', value: 'o' },
            { name: 'Scalar', value: 'o' },
            new inquirer.Separator(),
            { name: 'More options', value: 'o' },
          ],
        },
      ]);
    });
}
