import { DECLARE_SERVER } from './src/effects/declareServer';

const initialState = { servers: [] };
export default function serverReducer(state = initialState, action) {
  switch (action.type) {
    case DECLARE_SERVER:
      return reduceDeclaredServer(state, action);
    default:
      return state;
  }
}

function reduceDeclaredServer(
  state,
  {
    name,
    archerRC,
    dependencies,
    devDependencies,
    entities,
    templateDir,
    middleware,
    value,
    getSchema,
  }
) {
  if (!name || !value) {
    throw new Error('Invalid name or value specified to DECLARE_SERVER');
  }

  const servers = [...state.servers].concat({
    name,
    archerRC,
    dependencies,
    devDependencies,
    entities,
    templateDir,
    middleware,
    value,
    getSchema,
  });

  return {
    ...state,
    servers,
  };
}
