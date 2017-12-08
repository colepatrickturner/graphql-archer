import { take } from '../effects';

const ANSWER = Symbol();

function takeAnswer(id) {
  return take({
    type: ANSWER,
    id,
  });
}

export default (id, queries) => takeAnswer(id, queries);
