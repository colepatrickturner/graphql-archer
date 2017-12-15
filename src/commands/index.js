import create from './create';
import generate from './generate';

const commandsArray = [create, generate];

export function registerCommands(args) {
  const { program } = args;
  commandsArray.forEach(command => {
    command(args);
  });

  return program;
}
