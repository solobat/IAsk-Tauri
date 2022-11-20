<template>
  <div class="page-dashboard">
    <div class="scenes-box">
      <div class="scenes">
        <a-tag
          class="scene"
          color="blue"
          v-for="scene in listData.scenes"
          :key="scene.id"
          @click="onSceneClick(scene)"
        >
          {{ scene.name }}
        </a-tag>
      </div>
    </div>
    <div class="columns">
      <Board
        title="Todo Questions"
        icon="check-square"
        iconClass="icon-todo"
        :list="listData.todoMessages"
        listClass="list-todo"
        :onItemClick="onMessageClick"
        textField="html"
      />
      <Board
        title="Marked Questions"
        icon="book"
        iconClass="icon-marked"
        :list="listData.markedMessages"
        listClass="list-marked"
        :onItemClick="onMessageClick"
        textField="html"
      />
      <Board
        title="Lifetime Questions"
        icon="sync"
        :list="listData.lifeTimeMessages"
        listClass="list-lifetime"
        :onItemClick="onMessageClick"
        textField="html"
      />
      <Board
        title="Sticky Notebooks"
        icon="pushpin"
        iconClass="icon-pin"
        :list="listData.stickyQuestions"
        :onItemClick="onQuestionClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import {
  list as questionList,
  detail as getQuestion,
} from "../server/controller/questionController";
import { allList as answerList } from "../server/controller/answerController";
import { list as sceneList } from "../server/controller/dictController";
import orderBy from "lodash/orderBy";
import { STATUS_TYPE } from "../enum";
import CONST from "../constant";
import { parseMarkdown } from "../helpers/marked.helper";
import Board from "../components/Board/index.vue";
import { useAppStore } from "../store";
import { onMounted, reactive } from "vue";
import { DictModel } from "../server/model/Dict";
import { EditableAnswer } from "../server/model/Answer";
import { EditableQuestion, QuestionModel } from "../server/model/Question";
import { emitter } from "../helpers/emitter.helper";
import { EditableScene } from "../store/modules/types";

const store = useAppStore();
const router = useRouter();
const listData: {
  stickyQuestions: QuestionModel[];
  todoMessages: EditableAnswer[];
  markedMessages: EditableAnswer[];
  lifeTimeMessages: EditableAnswer[];
  scenes: DictModel[];
} = reactive({
  stickyQuestions: [],
  todoMessages: [],
  markedMessages: [],
  lifeTimeMessages: [],
  scenes: [],
});

function loadData() {
  loadScenes();
  loadQuestions();
  loadAnswers();
}

function bindEvents() {
  emitter.on("import:done", () => {
    onImportDone();
  });
}

function onImportDone() {
  loadData();
}

async function loadScenes() {
  const scenes = await sceneList(1);

  listData.scenes = scenes;
}
function loadQuestions() {
  questionList().then((results) => {
    const list = results.filter((item) => item.sticky);

    listData.stickyQuestions = orderBy(list, ["updateTime"], ["desc"]);
  });
}
function loadAnswers() {
  answerList().then((results) => {
    const todoMessages: EditableAnswer[] = [];
    const markedMessages: EditableAnswer[] = [];
    const lifeTimeMessages: EditableAnswer[] = [];

    const flist: EditableAnswer[] = orderBy(
      results.filter((item) => item.deleted === 0),
      ["createTime"],
      "desc"
    );

    flist.forEach((item) => {
      let list;
      const status = item.status;

      switch (status) {
        case STATUS_TYPE.TODO:
          list = todoMessages;
          break;
        case STATUS_TYPE.MARKED:
          list = markedMessages;
          break;
        case STATUS_TYPE.LIFETIME:
          list = lifeTimeMessages;
          break;
        default:
          break;
      }

      if (list) {
        item.html = parseMarkdown(item.content);
        list.push(item);
      }
    });
    listData.todoMessages = todoMessages.slice(0, 20);
    listData.markedMessages = markedMessages.slice(0, 20);
    listData.lifeTimeMessages = lifeTimeMessages.slice(0, 20);
  });
}

function onSceneClick(scene: EditableScene) {
  window.localStorage.setItem(CONST.STORAGE.QID, "0");
  window.localStorage.setItem(CONST.STORAGE.SID, scene.id.toString());
  store.commit("SET_CURRENT_QID", 0);
  store.commit("SET_CURRENT_SID", scene.id);
  router.push({ name: "Note" });
}

function onQuestionClick(question: EditableQuestion) {
  window.localStorage.setItem(CONST.STORAGE.QID, question.id.toString());
  window.localStorage.setItem(CONST.STORAGE.SID, question.sid.toString());
  store.commit("SET_CURRENT_QID", question.id);
  store.commit("SET_CURRENT_SID", question.sid);
  router.push({ name: "Note" });
}

function onMessageClick(message: EditableAnswer) {
  gotoMessage(message);
}

async function gotoMessage(message: EditableAnswer) {
  window.localStorage.setItem(CONST.STORAGE.QID, message.qid.toString());
  const question = await getQuestion(message.qid);

  store.commit("SET_CURRENT_SID", question?.sid);
  store.commit("SET_CURRENT_QID", message.qid);
  router.push({ name: "Note", query: { aid: message.id } });
}

onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
@import "../styles/css/normalize.css";
@import "../styles/scss/theme.scss";

.scenes-box {
  margin-top: 50px;
  margin-left: 33px;
}

.scenes {
  display: flex;
  flex-wrap: wrap;
}

.scene {
  padding: 4px 12px;
  margin-right: 10px;
  cursor: pointer;
}

.columns {
  display: flex;
  justify-content: space-evenly;
  margin-top: 30px;
}
</style>
<style lang="scss">
@import "../styles/css/normalize.css";
@import "../styles/scss/theme.scss";

.icon-pin {
  color: $color-primary;
}

.list-wrap {
  p {
    margin-bottom: 0;
  }
}

.list-todo {
  .item {
    border-color: $color-todo;
    color: $color-todo;
  }
}

.list-marked {
  .item {
    border-color: $color-marked;
    color: $color-marked;
  }
}

.list-lifetime {
  .item {
    border-color: $color-lifetime;
    color: $color-lifetime;
  }
}
</style>
