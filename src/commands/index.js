import create from './create';

const commandsArray = [create];

export function registerCommands(args) {
  const { program } = args;
  commandsArray.forEach(command => {
    command(args);
  });

  return program;
}
