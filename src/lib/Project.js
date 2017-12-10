import fs from 'fs-extra';
import path from 'path';
import mkdirp from 'mkdirp';
import { success, fail } from '../lib/output';

export function toFileSystemName(name) {
  return name.replace(/[^a-zA-Z0-9\-]/g, '');
}

export function createProject(name) {
  const cwd = path.resolve(`./${name}`);
  if (fs.existsSync(cwd)) {
    throw new Error(`Path ${cwd} already exists, aborting...`);
  }

  // Make our project folder
  mkdirp(cwd);

  // Copy our root template
  const templatePath = path.resolve(path.join(__dirname), '../../template/');
  fs.copySync(templatePath, cwd);
  success(`Copied base project to ${cwd}`);

  return {
    name,
    cwd,
  };
}
