import { select } from 'redux-saga/effects';

export function selector(state) {
  return state['graphql-archer-servers'].servers;
}

export default function getServerOptions() {
  return select(selector);
}
