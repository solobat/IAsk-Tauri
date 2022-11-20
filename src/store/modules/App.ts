import { getWebDavURL } from "../../helpers/webdav.helper";
import { AppState, RootState } from "./types";
import { MutationTree, ActionTree, GetterTree, Module } from "vuex";

const state: AppState = {
  settingsModalVisible: false,
  webdavModalVisible: false,
  shortcutsModalVisible: false,
  shouldSync: false,
  webdavURL: getWebDavURL(),
};

const mutations: MutationTree<AppState> = {
  SET_SETTINGS_MODAL(state, val) {
    state.settingsModalVisible = val;
  },
  SET_WEBDAV_MODAL(state, val) {
    state.webdavModalVisible = val;
  },
  SET_SHORTCUTS_MODAL(state, val) {
    state.shortcutsModalVisible = val;
  },
  SET_WEBDAVURL(state, val) {
    state.webdavURL = val;
  },
  SET_SHOULD_SYNC(state, val) {
    state.shouldSync = val;
  },
};

const actions: ActionTree<AppState, RootState> = {
  refreshWebdavURL({ commit }) {
    commit("SET_WEBDAVURL", getWebDavURL());
  },
};

const getters: GetterTree<AppState, RootState> = {
  settingsModalVisible: (state) => state.settingsModalVisible,
  webdavModalVisible: (state) => state.webdavModalVisible,
  shortcutsModalVisible: (state) => state.shortcutsModalVisible,
  webdavURL: (state) => state.webdavURL,
  shouldSync: (state) => state.shouldSync,
};

export default {
  state,
  mutations,
  actions,
  getters,
} as Module<AppState, RootState>;
