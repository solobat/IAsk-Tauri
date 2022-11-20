import * as questionController from "../../server/controller/questionController";
import * as dictController from "../../server/controller/dictController";
import CONST from "../../constant";
import orderBy from "lodash/orderBy";
import { EditableScene, NoteState, RootState } from "./types";
import { MutationTree, ActionTree, GetterTree, Module } from "vuex";

const state: NoteState = {
  scenesModalVisible: false,
  qaddVisible: false,
  curQid: -1,
  curSid: -1,
  qkeyword: "",
  scenes: [],
  questions: [],
  editingMsg: null,
  editingSid: -1,
  newAnswerText: "",
  qLoading: true,
  imgPreview: "",
  aid: 0,
};

const mutations: MutationTree<NoteState> = {
  SET_SCENES_MODAL_VISIBLE(state, visible) {
    state.scenesModalVisible = visible;
  },
  SET_QUESTION_ADD_VISIBLE(state, visible) {
    state.qaddVisible = visible;
  },
  SET_CURRENT_QID(state, qid) {
    state.curQid = qid;
  },
  SET_CURRENT_SID(state, sid) {
    state.curSid = sid;
  },
  SET_SCENES(state, list) {
    state.scenes = list;
  },
  SET_EDITING_SID(state, sid) {
    state.editingSid = sid;
  },
  SET_QUESTIONS(state, list) {
    state.questions = list;
  },
  SET_QUESTION_KEYWORD(state, keyword) {
    state.qkeyword = keyword;
  },
  SET_EDITING_MSG(state, msg) {
    state.editingMsg = msg;
  },
  SET_NEW_ANSWER_TEXT(state, text) {
    state.newAnswerText = text;
  },
  SET_QUESTION_LOADING(state, loading) {
    state.qLoading = loading;
  },
  SET_AID(state, aid) {
    state.aid = aid;
  },
  SET_IMG_PREVIEW(state, imgurl) {
    state.imgPreview = imgurl;
  },
  UPDATE_QUESTION_ATTRS(state, attrs) {
    const { id, ...rest } = attrs;
    const question = state.questions.find((item) => item.id === id);

    Object.assign(question || {}, rest);
  },
};

const actions: ActionTree<NoteState, RootState> = {
  showScenesModal({ commit }) {
    commit("SET_SCENES_MODAL_VISIBLE", true);
  },

  hideScenesModal({ commit }) {
    commit("SET_SCENES_MODAL_VISIBLE", false);
  },

  showQuestionAddModal({ commit }) {
    commit("SET_QUESTION_ADD_VISIBLE", true);
  },

  hideQuestionAddModal({ commit }) {
    commit("SET_QUESTION_ADD_VISIBLE", false);
  },

  async loadScenes({ commit, state }) {
    let rawScenes = await dictController.list(1);

    const scenes = [
      { id: -1, name: "全部" },
      { id: 0, name: "未分类" },
      ...rawScenes.map((item) => ({ ...item, onedit: false } as EditableScene)),
    ];
    commit("SET_SCENES", scenes);

    const sid =
      state.curSid || Number(window.localStorage.getItem(CONST.STORAGE.SID));
    const curSid = isNaN(sid) ? -1 : sid;
    const item = scenes.find((item) => item.id === curSid);

    if (item) {
      commit("SET_CURRENT_SID", curSid);
    }
  },

  loadQuestions({ commit }) {
    questionController.list().then((list = []) => {
      commit("SET_QUESTION_LOADING", false);
      const items = orderBy(list, ["sticky", "updateTime"], ["desc", "desc"]);
      commit("SET_QUESTIONS", items);
      commit(
        "SET_CURRENT_QID",
        Number(localStorage.getItem(CONST.STORAGE.QID)) || -1
      );
    });
  },

  updateQuestion({ getters, commit }, attrs = {}) {
    commit("SET_SHOULD_SYNC", true);

    return questionController.update({
      id: getters.currentQuestion.id,
      ...attrs,
      updateTime: Number(new Date()),
    });
  },

  exitEditing({ commit }) {
    commit("SET_EDITING_MSG", null);
    commit("SET_NEW_ANSWER_TEXT", "");
  },

  exitEditingScene({ commit }) {
    commit("SET_EDITING_SID", -1);
  },
};

const getters: GetterTree<NoteState, RootState> = {
  scenesModalVisible: (state) => state.scenesModalVisible,
  qaddVisible: (state) => state.qaddVisible,
  curQid: (state) => state.curQid,
  curSid: (state) => state.curSid,
  scenes: (state) => state.scenes,
  questions: (state) => state.questions,
  qkeyword: (state) => state.qkeyword,
  currentQuestion(state) {
    return state.questions.find((item) => item.id === state.curQid);
  },
  editingMsg: (state) => state.editingMsg,
  newAnswerText: (state) => state.newAnswerText,
  qLoading: (state) => state.qLoading,
  aid: (state) => state.aid,
  imgPreview: (state) => state.imgPreview,
};

export default {
  state,
  mutations,
  actions,
  getters,
} as Module<NoteState, RootState>;
