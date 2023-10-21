<template>
  <div class="qlist-wrap">
    <div
      class="qitem-wrap"
      v-for="item in filterredQuestions"
      :key="item.id"
      :class="{
        'is-active': item.id === curQid,
        'is-sticky': item.sticky == 1,
      }"
    >
      <a-popover
        :visible="item.id === menuVisibleId"
        trigger="contextmenu"
        placement="rightTop"
        overlayClassName="q-options-popup"
        @visibleChange="onMenuVisibleChange(item)"
      >
        <template #content>
          <div class="q-options">
            <a-menu class="q-options-menu">
              <a-menu-item
                @click="stickyQuestion(item)"
                class="q-option"
                key="sticky"
                >{{ item.sticky ? "取消置顶" : "置顶" }}</a-menu-item
              >
              <a-menu-item
                @click="onRenameClick(item)"
                class="q-option"
                key="rename"
                >重命名</a-menu-item
              >
              <a-sub-menu
                key="move"
                title="移动到"
                popupClassName="q-options-submenu"
              >
                <a-menu-item
                  v-for="sitem in scenes"
                  :key="sitem.id"
                  class="q-option"
                  :disabled="item.id === curSid"
                  @click="onQuestionMoveClick(item, sitem.id)"
                  >{{ sitem.name }}</a-menu-item
                >
              </a-sub-menu>
              <a-menu-item
                key="archive"
                @click="archiveQuestion(item)"
                class="q-option"
                >归档</a-menu-item
              >
            </a-menu>
          </div>
        </template>
        <div class="qitem" @click="onItemClick(item.id)">
          <div class="qitem-tit">{{ item.content }}</div>
        </div>
        <PushpinOutlined class="icon-pin" v-if="item.sticky == 1" />
      </a-popover>
    </div>
    <a-modal
      :visible="renameModalVisible"
      title="编辑名称"
      @ok="onQnameEditOk"
      @cancel="renameModalVisible = false"
    >
      <a-input v-model:value="curQForm.name" @pressEnter="onQnameEditOk" />
    </a-modal>
    <a-empty style="margin-top: 10px" v-if="!filterredQuestions.length" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { PushpinOutlined } from "@ant-design/icons-vue";
import { Modal } from "ant-design-vue";
import CONST from "../../constant";
import { useAppStore } from "../../store";
import { QuestionModel } from "../../server/model/Question";

const store = useAppStore();
const renameModalVisible = ref(false);
const curQForm = reactive({
  name: "",
  id: 0,
  ref: null as QuestionModel | null,
});
const menuVisibleId = ref(-1);
const scenes = computed(() => store.state.Note.scenes);
const questions = computed(() => store.state.Note.questions);
const qkeyword = computed(() => store.state.Note.qkeyword);
const curSid = computed(() => store.state.Note.curSid);
const curQid = computed(() => store.state.Note.curQid);
const currentQuestion = computed(() =>
  store.state.Note.questions.find((item) => item.id === store.state.Note.curQid)
);
const validSids = computed(() => {
  return scenes.value.filter((item) => item.id > 0).map((item) => item.id);
});
const filterredQuestions = computed(() => {
  const text = qkeyword.value.trim();
  let qs;

  if (curSid.value === -1) {
    qs = questions.value.filter((item) => item.sid !== CONST.DB.TEMPLATE_SID);
  } else if (curSid.value === 0) {
    qs = questions.value.filter(
      (item) => validSids.value.indexOf(item.sid) === -1
    );
  } else {
    qs = questions.value.filter((item) => item.sid === curSid.value);
  }

  if (text) {
    return qs.filter((item) => item.content.indexOf(text) !== -1);
  } else {
    return qs;
  }
});

function onMenuVisibleChange(item: QuestionModel) {
  if (item.id !== menuVisibleId.value) {
    menuVisibleId.value = item.id;
  } else {
    resetMenuVisible();
  }
}

function onItemClick(qid: number) {
  store.commit("SET_CURRENT_QID", qid);
}

function onRenameClick(item: QuestionModel) {
  curQForm.id = item.id;
  curQForm.name = item.content;
  curQForm.ref = item;

  resetMenuVisible();
  renameModalVisible.value = true;
}

function resetCurQForm() {
  curQForm.name = "";
  curQForm.id = 0;
  curQForm.ref = null;
}

async function onQnameEditOk() {
  const { id, name, ref: item } = curQForm;

  await updateQuestion({
    id,
    content: name,
  });
  store.commit("UPDATE_QUESTION_ATTRS", {
    id: item?.id,
    content: name,
  });
  renameModalVisible.value = false;
  resetCurQForm();
}

function archiveQuestion(item: QuestionModel) {
  Modal.confirm({
    content: "Do you want to archive this item?",
    onOk: async () => {
      const { id } = item;

      await updateQuestion({
        id,
        archived: 1,
      });
      store.dispatch("loadQuestions");
    },
    onCancel() {},
  });
}
async function onQuestionMoveClick(item: QuestionModel, sid: number) {
  const { id } = item;

  resetMenuVisible();
  await updateQuestion({
    id,
    sid,
  });
  store.commit("UPDATE_QUESTION_ATTRS", {
    id: item.id,
    sid: sid,
  });
}

function resetMenuVisible() {
  menuVisibleId.value = 0;
}

function updateQuestion(attrs: Partial<QuestionModel>) {
  store.dispatch("updateQuestion", attrs || {});
}

async function stickyQuestion(item: QuestionModel) {
  const { id, sticky } = item;
  const newSticky = sticky ? 0 : 1;

  await updateQuestion({
    id,
    sticky: newSticky,
  });
  store.dispatch("loadQuestions");
}
</script>

<style lang="scss">
@import "../../styles/css/normalize.css";
@import "../../styles/scss/theme.scss";

.qlist-wrap {
  height: calc(100vh - 104px);
  overflow: auto;

  &::-webkit-scrollbar {
    display: none;
  }

  &::-webkit-scrollbar-thumb {
    background: transparent;
    transition: background 1s;
  }

  &:hover {
    &::-webkit-scrollbar {
      display: initial;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.3);
    }
  }
}

.qitem-wrap {
  padding-left: 15px;
  background: #fff;
  -webkit-user-select: none;

  &:hover {
    background: #f6f6f7;
  }

  &.is-sticky {
    position: relative;

    .icon-pin {
      position: absolute;
      top: 3px;
      left: 225px;
      color: $color-primary;
    }
  }

  &.is-active {
    background: #f1f2f3;
  }
}

.q-options-popup {
  .ant-popover-arrow {
    display: none;
  }

  .ant-popover-inner {
    background: #efefef;
    padding: 5px 0;
  }

  .ant-popover-inner-content {
    padding: 0;
  }
}

.q-options {
  .q-options-menu {
    background: #efefef;
  }
  .q-option {
    width: 120px;
    font-size: 14px;
    padding: 3px 0 3px 15px;
    cursor: pointer;

    &:hover {
      color: #fff !important;
      background: $color-primary;
    }
  }
}

.ant-menu-submenu-popup,
.ant-menu-submenu > .ant-menu {
  background: #efefef !important;
}

.qitem {
  position: relative;
  padding: 14px 15px 14px 0;
  height: 66px;
  font-size: 14px;

  &::after {
    display: block;
    position: absolute;
    content: "";
    height: 1px;
    background: $border-color;
    left: 0;
    bottom: 0;
    width: 100%;
    transform: scaleY(0.5);
  }

  .qitem-tit {
    display: -webkit-box;
    overflow: hidden;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}
</style>
