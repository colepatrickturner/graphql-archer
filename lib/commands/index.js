import create from './create';

const commandsArray = [create];

export function registerCommands(program) {
  commandsArray.forEach(command => {
    command(program);
  })

  return program;
}