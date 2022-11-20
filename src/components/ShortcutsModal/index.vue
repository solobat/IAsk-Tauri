<template>
  <a-modal
    title="Shortcuts"
    :visible="shortcutsModalVisible"
    :footer="null"
    @change="onModalChange"
  >
    <p
      v-for="(config, index) in keyboardConfigs"
      :key="index"
      class="shortcut-item"
    >
      <span
        class="key-item"
        v-for="(key, index) in config.showValue"
        :key="index"
        >{{ key }}</span
      >
      <span class="shortcut-label">{{ config.label }}</span>
    </p>
  </a-modal>
</template>

<script setup lang="ts">
import {
  ACTIONS,
  bindKey,
  keyboardConfigs,
} from "../../helpers/keyboard.helper";
import { useAppStore } from "../../store";
import { computed } from "@vue/reactivity";

const store = useAppStore();
const config = computed(() => store.state.Config);
const shortcutsModalVisible = computed(
  () => store.state.App.shortcutsModalVisible
);

function onModalChange(val: any) {
  store.commit("SET_SHORTCUTS_MODAL", val);
}
</script>

<style lang="scss">
@import "../../styles/css/normalize.css";
@import "../../styles/scss/theme.scss";

.shortcut-item {
  display: flex;
  align-items: center;

  .key-item {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 4px;
    background: #5d646f;
    border-radius: 4px;
    width: 25px;
    height: 25px;
    color: #fff;
  }

  .shortcut-label {
    margin-left: 3px;
  }
}
</style>
