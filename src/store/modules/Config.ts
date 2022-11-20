import { getConfig, getDefaultConfig } from "../../helpers/config.helper";
import setByPath from "lodash/set";
import { ConfigState, RootState } from "./types";
import { MutationTree, ActionTree, GetterTree, Module } from "vuex";

const state: ConfigState = getDefaultConfig();

const mutations: MutationTree<ConfigState> = {
  SET_CONFIG(state, config) {
    Object.assign(state, config);
  },
  SET_CONFIG_BY_KEY(state, { key, value }) {
    setByPath(state, key, value);
  },
};

const actions: ActionTree<ConfigState, RootState> = {
  async loadConfig({ commit }) {
    const config = await getConfig();

    commit("SET_CONFIG", config);
  },

  setConfig({ commit }, payload) {
    commit("SET_CONFIG_BY_KEY", payload);
  },
};

const getters: GetterTree<ConfigState, RootState> = {
  defaultFoldAll: (state) => state.general.defaultFoldAll,
  sendMessage: (state) => state.shortcuts.sendMessage,
  syncInterval: (state) => state.sync.interval,
};

export default {
  state,
  mutations,
  actions,
  getters,
} as Module<ConfigState, RootState>;
