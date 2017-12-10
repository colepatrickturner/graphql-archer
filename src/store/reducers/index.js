import { combineReducers } from 'redux';
import project from './project';
import { getPluginReducersObject } from '../../lib/Archer';

export default combineReducers({
  project,
  ...getPluginReducersObject(),
});
