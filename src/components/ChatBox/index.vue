<template>
  <div class="chat-box" v-if="currentQuestion">
    <div class="chatbox-topbar">
      <div class="tit" @dblclick="onRevealClick">
        {{ currentQuestion.content }}
      </div>
      <div class="chatbox-tools">
        <a-input-search
          placeholder="搜索"
          style="width: 200px"
          size="small"
          allowClear
          @search="onSearch"
        />
        <a-select
          v-model:value="filter.statusType"
          size="small"
          style="width: 120px"
        >
          <a-select-option :value="-1">All</a-select-option>
          <a-select-option :value="0">Unresolved</a-select-option>
          <a-select-option :value="1">Resolved</a-select-option>
          <a-select-option :value="2">Todo</a-select-option>
          <a-select-option :value="3">Marked</a-select-option>
          <a-select-option :value="4">Lifetime</a-select-option>
        </a-select>
        <SortDescendingOutlined
          v-if="currentQuestion.sid === CONST.DB.TEMPLATE_SID"
          @click="onSortClick"
        />
        <FileMarkdownOutlined @click="onChatboxFileClick" />
      </div>
    </div>
    <MessageList
      :editingMsg="editingMsg"
      :list="filterredAnswers"
      :loading="loading"
      ref="list"
      @deleteItem="onDeleteItem"
      @toggleItemType="onToggleItemType"
      @refreshItem="onRefreshItem"
      @foldUpdate="updateFold"
      @load-more="loadMore"
    />
    <Editor
      :content="newAnswerText"
      :type="editorType"
      @send="onSend"
      @cancel="onEditorCancel"
    />
    <QuestionsSortModal
      :items="listData.questionsToSort"
      @ok="onSortOk"
      @cancel="onSortCancel"
      v-if="questionsSortModalVisible"
    />
  </div>
</template>

<script setup lang="ts">
import Editor from "../../components/Editor/index.vue";
import {
  ref,
  computed,
  reactive,
  watch,
  nextTick,
  onMounted,
  onUnmounted,
} from "vue";
import MessageList from "../../components/MessageList/index.vue";
import CONST from "../../constant";
import { getMsgType, getToggledMsgType } from "../../helpers/msg.helper";
import * as answerController from "../../server/controller/answerController";
import { MSG_TYPE, STATUS_TYPE } from "../../enum";
import { parseMarkdown } from "../../helpers/marked.helper";
import { getMsgTime } from "../../helpers/time.helper";
import {
  SortDescendingOutlined,
  FileMarkdownOutlined,
} from "@ant-design/icons-vue";
import {
  convertFile2Blob,
  downloadAsText,
  downloadQuestion,
} from "../../helpers/file.helper";
import { EditableAnswer } from "../../server/model/Answer";
import { QuestionModel } from "../../server/model/Question";
import { useAppStore } from "../../store";
import { message } from "ant-design-vue";
// import AppEventMixin from "../../mixins/appEvent.mixin";
import QuestionsSortModal from "../../components/QuestionsSortModal/index.vue";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { emitter } from "../../helpers/emitter.helper";

const store = useAppStore();
const filter = reactive({
  statusType: -1,
});
const questionsSortModalVisible = ref(false);
const listData: {
  answers: EditableAnswer[];
  foldedIds: number[];
  questionsToSort: EditableAnswer[];
} = reactive({
  answers: [],
  foldedIds: [],
  questionsToSort: [],
});
const keyword = ref("");
const allFolded = ref(false);
const currentQuestion = computed(() => store.getters.currentQuestion);
const qaddVisible = computed(() => store.state.Note.qaddVisible);
const curQid = computed(() => store.state.Note.curQid);
const curSid = computed(() => store.state.Note.curSid);
const newAnswerText = computed(() => store.state.Note.newAnswerText);
const editingMsg = computed(() => store.state.Note.editingMsg);
const loading = ref(true);
const newAnswer = ref<any>(null);
const list = ref<any>(null);
const filterredAnswers = computed(() => {
  const statusType = filter.statusType;
  let results;

  if (statusType === -1) {
    results = listData.answers.slice(0);
  } else {
    let shouldHide = true;

    results = listData.answers.filter((item) => {
      if (item.type === 0) {
        const result = item.status === statusType;

        shouldHide = !result;

        return result;
      } else {
        return !shouldHide;
      }
    });
  }
  if (keyword.value) {
    results = results.filter(
      (item) => item.content.indexOf(keyword.value) !== -1
    );
  }

  showLatestOnePage(results, true);

  return results as EditableAnswer[];
});

const editorType = computed(() => {
  if (editingMsg.value) {
    return "edit";
  } else {
    return "create";
  }
});

watch(
  curQid,
  () => {
    onCurQidChange();
  },
  { immediate: true }
);

let unlistenFns: UnlistenFn[] = [];

onMounted(async () => {
  const unlistenFn = await listen<{ message: string }>(
    "menu_event",
    ({ payload }) => {
      const [eventKey, eventValue] = payload.message.split("_");

      if (eventKey === "Editor") {
        if (eventValue === "FoldAll") {
          toggleFoldAllDialogs();
        }
      }
    }
  );
  unlistenFns.push(unlistenFn);
});

onUnmounted(() => {
  unlistenFns.forEach((fn) => fn());
});

function onImportDone() {
  loadAnswers();
}

function onRevealClick() {
  store.commit("SET_CURRENT_SID", currentQuestion.value.sid || 0);
}

function onSearch(value: string) {
  keyword.value = value;
}

function onSortClick() {
  listData.questionsToSort = listData.answers.slice(0);

  questionsSortModalVisible.value = true;
}

function onChatboxFileClick() {
  if (listData.answers.length) {
    downloadQuestion(currentQuestion.value, listData.answers);
  }
}

function getNewAnswerMeta() {
  if (filter.statusType !== -1 && filterredAnswers.value.length) {
    const latest = filterredAnswers.value[filterredAnswers.value.length - 1];

    return {
      createTime: latest.createTime ?? 0 + 1,
      updateTime: latest.updateTime ?? 0 + 1,
    };
  } else {
    return {};
  }
}

function createMsg(content: string, asQuestion: boolean) {
  const meta = getNewAnswerMeta();
  const type =
    curSid.value === CONST.DB.TEMPLATE_SID || asQuestion ? 0 : void 0;

  answerController
    .put({
      content,
      qid: currentQuestion.value.id,
      type,
      ...meta,
    })
    .then(() => {
      store.commit("SET_NEW_ANSWER_TEXT", "");
      loadAnswers();
      store.dispatch("updateQuestion");
      store.commit("SET_SHOULD_SYNC", true);
    });
}

function editMsg(content: string) {
  const { id } = editingMsg.value!;

  answerController
    .update({
      id,
      content,
    })
    .then(() => {
      // NOTE: 编辑时不滚动
      list.value!.scrollDisabled = true;
      const index = listData.answers.findIndex((item) => item.id === id);
      listData.answers.splice(index, 1, {
        ...editingMsg.value!,
        content,
        html: parseMarkdown(content),
      });

      store.dispatch("exitEditing");
      message.success("编辑成功");
      store.commit("SET_SHOULD_SYNC", true);
    });
}

function onSend(content: string, asQuestion: boolean) {
  if (content) {
    if (!editingMsg.value) {
      createMsg(content, asQuestion);
    } else {
      editMsg(content);
    }
  } else {
    message.warning("不能为空");
  }
}

function onEditorCancel() {
  store.dispatch("exitEditing");
}

function onCurQidChange() {
  if (curQid.value !== -1) {
    loadAnswers(true);
    window.localStorage.setItem(CONST.STORAGE.QID, String(curQid.value));
    nextTick(() => {
      if (newAnswer.value) {
        setTimeout(() => {
          newAnswer.value!.focus();
        }, 100);
      }
    });
  }
}

function loadAnswers(firstOpen?: boolean) {
  const foldedIds = listData.answers
    .filter((item) => item.type === MSG_TYPE.QUESTION && item.folded)
    .map((item) => item.id);

  listData.foldedIds = foldedIds;
  answerController.list(curQid.value).then((res = []) => {
    let shouldHide = false;
    const list = res as EditableAnswer[];

    const items = list.map((item, index) => {
      const { content, id, type: typeVal, status = 0 } = item;
      const folded = firstOpen
        ? allFolded.value ||
          status === STATUS_TYPE.RESOLVED ||
          status === STATUS_TYPE.NOT_RESOLVE
        : foldedIds.indexOf(id) !== -1;
      const type = getMsgType(content, typeVal);

      if (type === MSG_TYPE.QUESTION) {
        shouldHide = folded;
      } else if (type === MSG_TYPE.SPLIT) {
        shouldHide = false;
        item.shouldHide = false;
      } else {
        item.shouldHide = shouldHide;
      }

      item.html = parseMarkdown(content);
      item.time = getMsgTime(item, index);
      item.menuVisible = false;

      return {
        ...item,
        type,
        folded,
        onedit: false,
        status,
      };
    });
    listData.answers = items;
  });
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });
}

async function showLatestOnePage(items: EditableAnswer[], reset?: boolean) {
  loading.value = true;

  if (reset) {
    items.forEach((item) => (item.willShow = false));
  }

  let len = items.length;
  const pageSize = 10;
  let count = 0;

  while (len-- && count < pageSize) {
    const item = items[len];

    if (!item.willShow) {
      item.willShow = true;
      if (item.type === MSG_TYPE.QUESTION) {
        count++;
      }
    }
  }

  await wait(500);
  loading.value = false;
}

function toggleFoldAllDialogs() {
  let shouldHide = false;

  listData.answers.forEach((item, index) => {
    const { content, id, type } = item;
    const folded = !allFolded.value;

    if (type === MSG_TYPE.QUESTION) {
      shouldHide = folded;
    } else if (type === MSG_TYPE.SPLIT) {
      shouldHide = false;
      item.shouldHide = false;
    } else {
      item.shouldHide = shouldHide;
    }

    item.folded = folded;
  });
  allFolded.value = !allFolded.value;
  if (!allFolded.value && list.value) {
    emitter.emit("updateScroll");
  }
}

function onToggleItemType(item: EditableAnswer) {
  answerController
    .update({
      id: item.id,
      type: getToggledMsgType(item.type),
    })
    .then(() => {
      loadAnswers();
    })
    .catch((error) => {
      console.log(error);
    });
  store.commit("SET_SHOULD_SYNC", true);
}

function onDeleteItem(item: EditableAnswer) {
  answerController.del(item.id).then(() => {
    loadAnswers();
  });
  store.commit("SET_SHOULD_SYNC", true);
}

function getDialogItems(index: number) {
  const items = [filterredAnswers.value[index]];
  const rest = filterredAnswers.value.slice(index + 1);
  let item = rest.shift();

  while (item?.type === MSG_TYPE.ANSWER) {
    items.push(item);
    item = rest.shift();
  }

  return items;
}

function refreshItems(items: EditableAnswer[]) {
  const nowtime = Number(new Date());
  const tasks = items.map((item, index) => {
    const { id } = item;
    const newtime = nowtime + index + 1;
    const newStatus =
      item.status === STATUS_TYPE.RESOLVED
        ? STATUS_TYPE.UNRESOLVED
        : item.status;
    const attrs = {
      id,
      status: newStatus,
      updateTime: newtime,
      createTime: newtime,
    };
    return answerController.update(attrs);
  });
  store.commit("SET_SHOULD_SYNC", true);
  return Promise.all(tasks);
}

function onRefreshItem(item: EditableAnswer, index = 0) {
  const items = getDialogItems(index);

  if (index < listData.answers.length - 1) {
    refreshItems(items).then(() => {
      loadAnswers();
      item.onedit = false;
      message.success("Refresh done!");
    });
  } else {
    item.onedit = false;
    message.warning("Already the latest!");
  }
}

function getMsgCls(type: number) {
  if (type === MSG_TYPE.QUESTION) {
    return "question";
  } else if (type === MSG_TYPE.ANSWER) {
    return "answer";
  } else if (type === MSG_TYPE.SPLIT) {
    return "split answer";
  }
}

function updateFold(item: EditableAnswer, newFolded?: boolean) {
  const folded =
    typeof newFolded !== "undefined" ? Boolean(newFolded) : !item.folded;
  let index = listData.answers.findIndex((one) => one.id === item.id) + 1;

  item.folded = folded;

  for (; index < listData.answers.length; index++) {
    const obj = listData.answers[index];

    if (obj.type === MSG_TYPE.ANSWER) {
      obj.shouldHide = folded;
    } else {
      return;
    }
  }
}

function loadMore() {
  showLatestOnePage(filterredAnswers.value);
}

function onSortOk(list: EditableAnswer[]) {
  refreshItems(list).then(() => {
    loadAnswers();
    message.success("重排成功");
  });
  questionsSortModalVisible.value = false;
}

function onSortCancel() {
  questionsSortModalVisible.value = false;
}
</script>

<style lang="scss">
@import "../../styles/css/normalize.css";
@import "../../styles/scss/theme.scss";

.chat-box {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100vh;
  background: $background-color;
}

.chatbox-topbar {
  position: relative;
  height: 64px;
  border-bottom: 1px solid $border-color;
  padding: 12px 15px;
  -webkit-user-select: none;
  -webkit-app-region: drag;

  .tit {
    color: $color-deep;
    font-weight: bold;
    font-size: 16px;
    user-select: none;
  }

  .chatbox-tools {
    position: absolute;
    right: 10px;
    bottom: 5px;
  }
}

.chat-none {
  align-items: center;
  justify-content: center;
}

.btn-add {
  border-radius: 50%;
  border: 1px solid $border-color;
  padding: 15px;
  cursor: pointer;

  img {
    width: 50px;
    height: 50px;
  }
}
</style>
