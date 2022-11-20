<template>
  <div
    class="chatbox-msgs"
    ref="answers"
    :class="{ 'editing-mode': editingMsg !== null }"
  >
    <template v-for="(item, index) in list" :key="item.id">
      <MessageTime
        v-if="
          item.time && (item.type === MSG_TYPE.ANSWER ? !item.shouldHide : true)
        "
        :key="`${item.id}_time`"
        :item="item"
      />
      <MessageItem
        :item="item"
        :index="index"
        @refresh="onRefresh"
        @delete="onDeleteOne"
        @toggleType="onToggleType"
        @foldUpdate="onFoldUpdate"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { MSG_TYPE } from "../../enum";
import MessageTime from "../MessageTime/index.vue";
import MessageItem from "../MessageItem/index.vue";
import { computed, defineProps, nextTick, PropType, ref, watch } from "vue";
import { EditableAnswer } from "../../server/model/Answer";
import { useAppStore } from "../../store";

const emit = defineEmits<{
  (event: "toggleItemType", item: EditableAnswer): void;
  (event: "refreshItem", item: EditableAnswer, index?: number): void;
  (event: "deleteItem", item: EditableAnswer): void;
  (event: "foldUpdate", item: EditableAnswer, flag?: boolean): void;
}>();
const props = defineProps({
  list: {
    type: Array as PropType<EditableAnswer[]>,
    default: () => [],
  },
});
const scrollDisabled = ref(false);
const store = useAppStore();
const editingMsg = computed(() => store.state.Note.editingMsg);
const aid = computed(() => store.state.Note.aid);
const answers = ref<HTMLDivElement | null>(null);

watch(
  () => props.list,
  () => {
    const item = props.list?.find((item) => item.id === aid.value);

    if (!item) {
      if (!scrollDisabled.value) {
        updateScroll();
      } else {
        scrollDisabled.value = false;
      }
    }
  }
);

function updateScroll() {
  nextTick(() => {
    const el = answers.value;

    if (el) {
      el.scrollTo(0, el.scrollHeight - el.clientHeight);
    }
  });
}

function onToggleType(item: EditableAnswer) {
  emit("toggleItemType", item);
}

function onDeleteOne(item: EditableAnswer) {
  scrollDisabled.value = true;
  emit("deleteItem", item);
}

function onRefresh(item: EditableAnswer, index?: number) {
  emit("refreshItem", item, index);
}

function onFoldUpdate(item: EditableAnswer, folded: boolean) {
  emit("foldUpdate", item, folded);
}
</script>

<style lang="scss">
@import "../../styles/css/normalize.css";
@import "../../styles/scss/theme.scss";

.chatbox-msgs {
  padding: 10px 22px;
  flex: 1;
  overflow: auto;

  &.editing-mode {
    overflow-y: hidden;

    .aitem-wrap {
      opacity: 0.1;

      &.is-editing {
        opacity: 1;
      }
    }
  }
}
</style>
