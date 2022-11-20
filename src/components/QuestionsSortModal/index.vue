<template>
  <a-modal :visible="visible" @ok="onSortOk" @cancel="onSortCancel">
    <div class="question-sort">
      <draggable v-model="questionsToSort" class="sort-questions" item-key="id">
        <template #item="{ element }">
          <div :key="element.id" class="sort-question">
            {{ element.content }}
          </div>
        </template>
      </draggable>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import draggable from "vuedraggable";
import { defineProps, PropType, ref } from "vue";

const props = defineProps({
  items: {
    type: Array as PropType<Array<any>>,
    default: () => [],
  },
});
const visible = ref(true);
const questionsToSort = ref(props.items.slice(0));
const emit = defineEmits(["ok", "cancel"]);

function onSortOk() {
  emit("ok", questionsToSort.value.slice(0));
}

function onSortCancel() {
  emit("cancel");
}
</script>

<style lang="scss">
@import "../../styles/css/normalize.css";
@import "../../styles/scss/theme.scss";

.sort-questions {
  margin-top: 25px;
}

.sort-question {
  padding: 10px 15px;
  border: 1px solid #ddd;
  cursor: move;
  margin-bottom: -1px;
  background: #fff;

  &:first-child {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }

  &:last-child {
    border-bottom-right-radius: 4px;
    border-bottom-left-radius: 4px;
    margin-bottom: 0;
  }
}
</style>
