<template>
  <div class="qlist-topbar">
    <a-input
      v-model:value="qsearchText"
      :allowClear="true"
      style="width: 200px"
      class="ipt-search"
      size="small"
      placeholder="搜索"
    />
    <div class="btn-add" @click="onAddClick">
      <img src="../../assets/svg/plus.svg" alt="plus" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useAppStore } from "../../store";

const store = useAppStore();
const qsearchText = ref("");

watch(qsearchText, (val) => {
  store.commit("SET_QUESTION_KEYWORD", val);
});

function onAddClick() {
  store.dispatch("showQuestionAddModal");
}
</script>

<style lang="scss">
@import "../../styles/css/normalize.css";
@import "../../styles/scss/theme.scss";

.qlist-topbar {
  display: flex;
  align-items: center;
  height: 64px;
  border-bottom: 1px solid $border-color;
  justify-content: space-evenly;

  .ipt-search {
    background: #e9e9ea;

    .ant-input {
      background: inherit;
    }
  }

  .btn-add {
    padding: 5px;
    width: 22px;
    height: 22px;

    img {
      display: block;
      width: 10px;
      height: 10px;
    }
  }
}
</style>
