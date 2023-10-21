<template>
  <div
    class="chatbox-msgs"
    ref="answers"
    :class="{ 'editing-mode': editingMsg !== null }"
  >
    <template v-for="(item, index) in list" :key="item.id">
      <MessageTime
        v-if="
          item.time &&
          (item.type === MSG_TYPE.ANSWER ? !item.shouldHide : true) &&
          item.willShow
        "
        :key="`${item.id}_time`"
        :item="item"
      />
      <MessageItem
        :item="item"
        :index="index"
        v-if="item.willShow"
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
import $ from "jquery";
import {
  computed,
  defineProps,
  nextTick,
  PropType,
  ref,
  watch,
  onMounted,
  onUnmounted,
} from "vue";
import { EditableAnswer } from "../../server/model/Answer";
import { useAppStore } from "../../store";
import { event } from "@tauri-apps/api";
import { emitter } from "../../helpers/emitter.helper";

const emit = defineEmits<{
  (event: "toggleItemType", item: EditableAnswer): void;
  (event: "refreshItem", item: EditableAnswer, index?: number): void;
  (event: "deleteItem", item: EditableAnswer): void;
  (event: "foldUpdate", item: EditableAnswer, flag?: boolean): void;
  (event: "loadMore"): void;
  (event: "itemUpdate", item: EditableAnswer): void;
}>();
const props = defineProps({
  list: {
    type: Array as PropType<EditableAnswer[]>,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: true,
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

function handleScroll(event: Event) {
  const el = event.target as HTMLDivElement;
  if (el.scrollTop === 0 && !props.loading) {
    emit("loadMore");
  }
}

function handleBoxClick(event: Event) {
  const elem = event.target as HTMLElement;
  if (elem && elem.tagName === "INPUT" && elem.id != null) {
    const $box = $(elem).closest(".aitem-wrap");
    const index = Array.from($box.find('input[type="checkbox"]')).findIndex(
      (el) => el.id === elem.id
    );
    const aid = $box.data("id");

    handleItemCheckboxClick(aid, index, (elem as HTMLInputElement).checked);
  }
}

onMounted(() => {
  const el = answers.value;
  if (el) {
    el.addEventListener("scroll", handleScroll);
    el.addEventListener("click", handleBoxClick);
  }

  emitter.on("editMsg", () => {
    scrollDisabled.value = true;
  });
});

function handleItemCheckboxClick(aid: number, index: number, checked: boolean) {
  const item = props.list.find((item) => item.id === aid);
  if (item) {
    const markdownText = item.content.trim();
    const lines = markdownText.split("\n");
    const line = lines[index];
    const updatedLine = line.replace(/\[.\]/, checked ? "[x]" : "[ ]");
    lines.splice(index, 1, updatedLine);

    item.content = lines.join("\n");

    emit("itemUpdate", item);
    // NOTE: 在当前 tick 冻结，在下个 tick 自动解冻
    scrollDisabled.value = true;
  }
}

onUnmounted(() => {
  const el = answers.value;
  if (el) {
    el.removeEventListener("scroll", handleScroll);
    el.removeEventListener("click", handleBoxClick);
  }
});

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
