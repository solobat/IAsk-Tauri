/**
 * The file enables `@/store/index.js` to import all vuex modules
 * in a one-shot manner. There should not be any reason to edit this file.
 */
import App from './App'
import Config from './Config'
import Note from './Note'
import { ModuleTree } from 'vuex'
import { RootState } from './types';

const modules: ModuleTree<RootState> = {
  App,
  Config,
  Note
};


export default modules;
