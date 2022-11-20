<template>
  <div class="chat-sidebar">
    <SideTopbar />
    <ScenesBar />
    <SessionList />
  </div>
</template>

<script setup lang="ts">
import SideTopbar from "../SideTopbar/index.vue";
import ScenesBar from "../ScenesBar/index.vue";
import SessionList from "../SessionList/index.vue";
</script>

<style lang="scss">
@import "../../styles/css/normalize.css";
@import "../../styles/scss/theme.scss";

.chat-sidebar {
  border: 1px solid $border-color;
  border-top: 0;
  border-bottom: 0;
  width: 248px;
  height: 100vh;
}
</style>
