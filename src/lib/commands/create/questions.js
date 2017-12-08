import inquirer from 'inquirer';

export const name = () => ({
  type: 'input',
  name: 'name',
  message: 'Please enter a name...',
});

export const reformattedName = name => ({
  type: 'expand',
  message: `Use folder name "${name}"?`,
  name: 'confirm',
  choices: [
    {
      key: 'y',
      name: 'Yes',
      value: 'y',
    },
    {
      key: 'n',
      name: 'No, choose new name',
      value: 'n',
    },
    new inquirer.Separator(),
    {
      key: 'x',
      name: 'Abort',
      value: 'x',
    },
  ],
});
