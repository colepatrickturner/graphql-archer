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

function getStateWithNewServer(
  state,
  { name, archerRC, dependencies, devDependencies, templateDir, middleware, value }
) {
  if (!name || !value) {
    throw new Error('Invalid name or value specified to ADD_SERVER_CHOICE');
  }

  const servers = [...state.servers].concat({
    name,
    archerRC,
    dependencies,
    devDependencies,
    templateDir,
    middleware,
    value,
  });

  return {
    ...state,
    servers,
  };
}
