export default function instrument(hook) {
  return new Promise(resolve => resolve());
}

export const BEFORE_CREATE = Symbol();
