import { ADD_SERVER_CHOICE } from './constants';

const initialState = { servers: [] };
export default function serverReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_SERVER_CHOICE:
      return getStateWithNewServer(state, action);
    default:
      return state;
  }
}

function getStateWithNewServer(state, { name, templateDir, value }) {
  if (!name || !value) {
    throw new Error('Invalid name or value specified to ADD_SERVER_CHOICE');
  }

  const servers = [...state.servers].concat({ name, templateDir, value });

  return {
    ...state,
    servers
  };
}