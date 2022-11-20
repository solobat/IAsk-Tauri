<template>
  <div
    class="aitem-wrap"
    ref="el"
    :key="`${item.id}_wrap`"
    v-if="item.type !== MSG_TYPE.QUESTION ? !item.shouldHide : true"
    :class="[`${getMsgCls(item.type)}`, { 'is-editing': inEditing }]"
  >
    <div class="aitem" v-if="item.type !== MSG_TYPE.QUESTION">
      <div class="aitem-text">
        <a-popover
          v-if="item.type === MSG_TYPE.ANSWER"
          v-model:value="item.menuVisible"
          :trigger="trigger"
          placement="top"
          overlayClassName="q-options-popup"
          :align="msgItemAlign"
          :destroyTooltipOnHide="true"
          @click="hideMenu"
          @visibleChange="onAnswerPopoverChange($event, item)"
        >
          <template #content>
            <div class="q-options">
              <a-menu class="q-options-menu">
                <a-menu-item
                  class="q-option"
                  @click="onAnswerSwitchClick(item)"
                  >{{
                    item.type === MSG_TYPE.QUESTION ? "转为回答" : "转为问题"
                  }}</a-menu-item
                >
                <a-menu-item class="q-option" @click="onEditClick(item, index)"
                  >编辑</a-menu-item
                >
                <a-menu-item class="q-option" @click="onAnswerDeleteClick(item)"
                  >删除</a-menu-item
                >
              </a-menu>
            </div>
          </template>
          <div
            v-html="item.html"
            @click.meta="onEditClick(item, index)"
            :style="{ 'user-select': item.onedit ? 'none' : 'initial' }"
          ></div>
        </a-popover>
        <div v-else v-html="item.html"></div>
      </div>
      <div class="aitem-logo">A</div>
    </div>
    <div
      class="aitem"
      v-if="item.type === MSG_TYPE.QUESTION"
      :ref="`a_${item.id}`"
    >
      <RightOutlined v-if="item.folded" @click="updateFold(item)" />
      <DownOutlined type="down" v-else @click="updateFold(item)" />
      <div class="aitem-logo">Q</div>
      <div class="aitem-text" :class="[`aitem-status-${item.status || 0}`]">
        <a-popover
          v-model:value="item.menuVisible"
          :trigger="trigger"
          placement="top"
          overlayClassName="q-options-popup"
          @click="hideMenu"
          :align="msgItemAlign"
          :destroyTooltipOnHide="true"
          @visibleChange="onAnswerPopoverChange($event, item)"
        >
          <template #content>
            <div class="q-options">
              <a-menu class="q-options-menu">
                <a-menu-item
                  class="q-option"
                  v-if="currentQuestion.sid !== CONST.DB.TEMPLATE_SID"
                  @click="onAnswerSwitchClick(item)"
                  >{{
                    item.type === MSG_TYPE.QUESTION ? "转为回答" : "转为问题"
                  }}</a-menu-item
                >
                <a-menu-item class="q-option" @click="onRefreshClick"
                  >刷新对话</a-menu-item
                >
                <a-menu-item class="q-option" @click="onEditClick(item, index)"
                  >编辑</a-menu-item
                >
                <a-sub-menu
                  key="move"
                  title="标记为"
                  class="q-options-menu"
                  v-if="currentQuestion.sid !== CONST.DB.TEMPLATE_SID"
                >
                  <a-menu-item
                    v-for="status in options.status"
                    :key="status.value"
                    class="q-option"
                    :class="[`mark-label-${status.value}`]"
                    :disabled="status.value === item.status"
                    @click="onChangeStatusClick(item, status)"
                    >{{ status.label }}</a-menu-item
                  >
                </a-sub-menu>
                <a-menu-item class="q-option" @click="onAnswerDeleteClick(item)"
                  >删除</a-menu-item
                >
              </a-menu>
            </div>
          </template>
          <div
            v-html="item.html"
            @click.meta="onEditClick(item, index)"
            :style="{ 'user-select': item.onedit ? 'none' : 'initial' }"
          ></div>
        </a-popover>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  defineProps,
  reactive,
  computed,
  PropType,
  nextTick,
  onMounted,
  ref,
} from "vue";
import { MSG_TYPE, STATUS_TYPE } from "../../enum";
import { getMsgType, getToggledMsgType } from "../../helpers/msg.helper";
import * as answerController from "../../server/controller/answerController";
import { mapGetters } from "vuex";
import CONST from "../../constant";
import { STATUS_OPTIONS } from "../../constant/base";
import { useAppStore } from "../../store";
import { RightOutlined, DownOutlined } from "@ant-design/icons-vue";
import { EditableAnswer } from "../../server/model/Answer";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";

const router = useRouter();
const emit = defineEmits<{
  (event: "toggleType", item: EditableAnswer): void;
  (event: "refresh", item: EditableAnswer, index?: number): void;
  (event: "delete", item: EditableAnswer): void;
  (event: "foldUpdate", item: EditableAnswer, flag?: boolean): void;
}>();
const store = useAppStore();

const props = defineProps({
  item: {
    type: Object as PropType<EditableAnswer>,
    required: true,
  },
  index: {
    type: Number,
  },
});

const options = {
  status: STATUS_OPTIONS,
};
const msgItemAlign = reactive({
  points: ["tc", "tc"] as string[],
  targetOffset: ["-75%", "100%"],
});
const currentQuestion = computed(() => store.getters.currentQuestion);
const editingMsg = computed(() => store.state.Note.editingMsg);
const aid = computed(() => store.state.Note.aid);
const inEditing = computed(() => editingMsg.value === props.item);
const trigger = computed(() => {
  return editingMsg.value ? "none" : "contextmenu";
});
const el = ref<HTMLDivElement | null>(null);

function getMsgCls(type: number) {
  if (type === MSG_TYPE.QUESTION) {
    return "question";
  } else if (type === MSG_TYPE.ANSWER) {
    return "answer";
  } else if (type === MSG_TYPE.SPLIT) {
    return "split answer";
  }
}
function toggleMsgType(item: EditableAnswer) {
  emit("toggleType", item);
}

function onAnswerSwitchClick(item: EditableAnswer) {
  toggleMsgType(item);
}

function onAnswerPopoverChange(visible: boolean, item: EditableAnswer) {
  item.onedit = visible;
}

function onRefreshClick() {
  emit("refresh", props.item, props.index);
}

function onChangeStatusClick(
  item: EditableAnswer,
  newStatusItem: typeof options.status[number]
) {
  const { id } = item;
  const newStatus = newStatusItem.value;

  answerController
    .update({
      id,
      status: newStatus,
    })
    .then(() => {
      item.status = newStatus;
      if (
        newStatus === STATUS_TYPE.RESOLVED ||
        newStatus === STATUS_TYPE.NOT_RESOLVE
      ) {
        emit("foldUpdate", item, true);
      }
      item.onedit = false;
      message.success("Update done!");
    });
}

function onEditClick(item: EditableAnswer, index?: number) {
  store.commit("SET_EDITING_MSG", item);
  store.commit("SET_NEW_ANSWER_TEXT", item.content);
  item.onedit = false;
  item.menuVisible = false;
}

function onAnswerDeleteClick(item: EditableAnswer) {
  emit("delete", item);
}

function updateFold(item: EditableAnswer) {
  emit("foldUpdate", item);
}

function hideMenu() {}

function scrollToAnswer() {
  router.replace({ query: {} })
  store.commit("SET_AID", 0);
  nextTick(() => {
    if (el.value) {
      el.value.scrollIntoView();
    }
  });
}

onMounted(() => {
  scrollToAnswer();
});
</script>

<style lang="scss">
@import "../../styles/css/normalize.css";
@import "../../styles/scss/theme.scss";

.aitem-wrap {
  display: flex;
  margin: 20px 0;

  &.question {
    justify-content: flex-start;

    .aitem {
      position: relative;
      justify-content: flex-start;

      .anticon {
        position: absolute;
        left: -17px;
        top: 8px;
        opacity: 0;
        cursor: pointer;
        transition: opacity 500ms ease-in;

        &.anticon-right {
          opacity: 1;
        }

        &:hover {
          opacity: 1;
        }
      }

      .aitem-text {
        background: #fff;
        border-radius: 2px 10px 10px 10px;

        &.aitem-status-1 {
          border-color: $color-resolved;
          background-color: $background-color;
        }

        &.aitem-status-2 {
          border-color: $color-todo;
          color: $color-todo;
        }

        &.aitem-status-3 {
          border-color: $color-marked;
          color: $color-marked;
        }

        &.aitem-status-4 {
          border-color: $color-lifetime;
          color: $color-lifetime;
        }

        &.aitem-status-9 {
          border-color: $color-notresolve;
          color: $color-notresolve;
        }
      }

      .aitem-logo {
        margin-right: 10px;
      }
    }
  }

  &.answer {
    justify-content: flex-end;

    .aitem {
      .aitem-text {
        border-radius: 10px 2px 10px 10px;
      }

      .aitem-logo {
        margin-left: 10px;
      }
    }
  }

  &.split {
    .aitem {
      justify-content: center;
      width: 100%;
      .aitem-text {
        width: 50%;
        padding: 0;
        background: transparent;
        border: 0;
        border-radius: 0;

        hr {
          display: block;
          height: 1px;
          border: 0;
          border-top: 1px solid #ccc;
          margin: 1em 0;
          padding: 0;
        }
      }

      .aitem-logo {
        display: none;
      }
    }
  }

  .aitem {
    display: flex;
    justify-content: flex-end;
    width: 50%;

    .aitem-text {
      padding: 8px 12px;
      background: #cee6fd;
      border: 1px solid #c4daf0;
      border-radius: 4px;
      font-size: 14px;

      p {
        &:last-child {
          margin-bottom: 0;
        }
      }

      img {
        max-width: 100%;
        min-width: 10px;
        width: auto;
        user-select: none;
      }
    }

    .aitem-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 2px;
      border: 1px solid #ccc;
      width: 30px;
      min-width: 30px;
      height: 30px;
      user-select: none;
    }
  }
}

.mark-label-2 {
  color: $color-todo;
}

.mark-label-3 {
  color: $color-marked;
}

.mark-label-4 {
  color: $color-lifetime;
}

.mark-label-9 {
  color: $color-notresolve;
}
</style>
