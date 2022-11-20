<template>
  <div class="page-review">
    <div class="filter">
      <a-select
        mode="multiple"
        :default-value="listData.selectedScenes"
        style="width: 100%"
        placeholder="Please select"
        @change="handleScenesChange"
      >
        <a-select-option v-for="item in listData.scenes" :key="item.id">
          {{ item.name }}
        </a-select-option>
      </a-select>
    </div>
    <div class="columns">
      <Board
        title="Weekly"
        :list="listData.weeklyMessages"
        listClass="list-weekly"
        :onItemClick="onMessageClick"
        textField="html"
      />
      <Board
        title="Monthly"
        :list="listData.monthlyMessages"
        listClass="list-monthly"
        :onItemClick="onMessageClick"
        textField="html"
      />
      <Board
        title="Quarterly"
        :list="listData.quarterlyMessages"
        listClass="list-quarterly"
        :onItemClick="onMessageClick"
        textField="html"
      />
      <Board
        title="More"
        :list="listData.moreMessages"
        listClass="list-more"
        :onItemClick="onMessageClick"
        textField="html"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  list as questionList,
  detail as getQuestion,
} from "../server/controller/questionController";
import {
  allList as answerList,
  list,
} from "../server/controller/answerController";
import { list as sceneList } from "../server/controller/dictController";
import orderBy from "lodash/orderBy";
import { STATUS_TYPE } from "../enum";
import CONST from "../constant";
import { parseMarkdown } from "../helpers/marked.helper";
import AppEventMixin from "../mixins/appEvent.mixin";
import { getInterval } from "../helpers/time.helper";
import Board from "../components/Board/index.vue";
import { useAppStore } from "../store";
import { useRouter } from "vue-router";
import { EditableAnswer } from "../server/model/Answer";
import { DictModel } from "../server/model/Dict";
import { EditableQuestion } from "../server/model/Question";
import { onMounted, reactive, watch } from "vue";
import { computed } from "@vue/reactivity";
import { emitter } from "../helpers/emitter.helper";

const store = useAppStore();
const router = useRouter();
const listData: {
  weeklyMessages: EditableAnswer[];
  monthlyMessages: EditableAnswer[];
  quarterlyMessages: EditableAnswer[];
  moreMessages: EditableAnswer[];
  scenes: DictModel[];
  selectedScenes: number[];
  questions: EditableQuestion[];
} = reactive({
  weeklyMessages: [],
  monthlyMessages: [],
  quarterlyMessages: [],
  moreMessages: [],
  scenes: [],
  selectedScenes: JSON.parse(
    window.localStorage.getItem(CONST.STORAGE.SELECTED_SIDS_FOR_REVIEW) || "[]"
  ),
  questions: [],
});
const validQids = computed(() => {
  if (listData.selectedScenes.length) {
    return listData.questions
      .filter((q) => listData.selectedScenes.includes(q.sid))
      .map((q) => q.id);
  } else {
    return "all";
  }
});

watch(validQids, () => {
  loadAnswers();
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
    listData.questions = results.filter((item) => !item.archived);
  });
}

function loadAnswers() {
  answerList().then((res) => {
    const results: EditableAnswer[] = res;
    const weeklyMessages: EditableAnswer[] = [];
    const monthlyMessages: EditableAnswer[] = [];
    const quarterlyMessages: EditableAnswer[] = [];
    const moreMessages: EditableAnswer[] = [];
    const rest = results.filter(
      (item) =>
        item.deleted === 0 &&
        item.status === STATUS_TYPE.RESOLVED &&
        (validQids.value === "all" || validQids.value.includes(item.qid))
    );

    orderBy(rest, ["updateTime"], "desc").forEach((item) => {
      let list;
      const interval = getInterval(item.updateTime ?? 0);
      const status = item.status;

      switch (interval) {
        case "weekly":
          list = weeklyMessages;
          break;
        case "monthly":
          list = monthlyMessages;
          break;
        case "quarterly":
          list = quarterlyMessages;
          break;
        case "more":
          list = moreMessages;
          break;
        default:
          break;
      }

      if (list) {
        item.html = parseMarkdown(item.content);
        list.push(item);
      }
    });
    listData.moreMessages = moreMessages.slice(0, 20);
    listData.weeklyMessages = weeklyMessages.slice(0, 20);
    listData.monthlyMessages = monthlyMessages.slice(0, 20);
    listData.quarterlyMessages = quarterlyMessages.slice(0, 20);
  });
}

function handleScenesChange(value: number[]) {
  window.localStorage.setItem(
    CONST.STORAGE.SELECTED_SIDS_FOR_REVIEW,
    JSON.stringify(value)
  );
  listData.selectedScenes = value;
}

function onMessageClick(message: EditableAnswer) {
  gotoMessage(message);
}

async function gotoMessage(message: EditableAnswer) {
  window.localStorage.setItem(CONST.STORAGE.QID, String(message.qid));
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

.filter {
  margin-top: 50px;
  margin-left: 33px;
  margin-right: 33px;
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

pre {
  &::-webkit-scrollbar {
    display: none;
    width: 2px;
    height: 4px;
  }
}

.icon-pin {
  color: $color-primary;
}

.list-weekly {
  .item {
    color: #000;
  }
}

.list-monthly {
  .item {
    color: #333;
  }
}

.list-quarterly {
  .item {
    color: #666;
  }
}

.list-more {
  .item {
    color: #999;
  }
}
</style>
