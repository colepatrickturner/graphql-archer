import { put } from '../effects';

export const QUESTION = Symbol();
export const ANSWER = Symbol();

export default function inquire(id, queries) {
  return put({
    type: QUESTION,
    id,
    queries,
  });
}
