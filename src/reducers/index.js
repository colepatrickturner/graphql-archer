import { combineReducers } from 'redux';
import project from './project';
import { getPluginReducersObject } from '../lib/util';

export default combineReducers({
  project,
  ...getPluginReducersObject(),
});
