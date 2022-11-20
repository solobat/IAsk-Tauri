<template>
  <div id="app" class="page-newtab">
    <ActionBar />
    <router-view class="container"></router-view>
    <SettingsModal />
    <WebdavModal />
    <ShortcutsModal />
  </div>
</template>

<script setup lang="ts">
import { defineComponent, onMounted, onUnmounted } from "vue";
import { mapGetters } from "vuex";
import { MyIcon } from "./helpers/icon.helper";
import ActionBar from "./components/ActionBar/index.vue";
import SettingsModal from "./components/SettingsModal/index.vue";
import WebdavModal from "./components/WebdavModal/index.vue";
import ShortcutsModal from "./components/ShortcutsModal/index.vue";
import { listen, Event as TauriEvent, UnlistenFn } from "@tauri-apps/api/event";
import { useRouter } from "vue-router";
import { useAppStore } from "./store";

const router = useRouter();
const store = useAppStore();
let unlistenFns: UnlistenFn[] = [];

onMounted(async () => {
  const unlistenFn = await listen<{ message: string }>(
    "menu_event",
    ({ payload }) => {
      const [eventKey, eventValue] = payload.message.split("_");

      if (eventKey === "Router") {
        router.push({ name: eventValue });
      } else if (eventKey === "Modal") {
        if (eventValue === "Settings") {
          store.commit("SET_SETTINGS_MODAL", true);
        } else if (eventValue === "Shortcuts") {
          store.commit("SET_SHORTCUTS_MODAL", true);
        }
      }
    }
  );
  unlistenFns.push(unlistenFn);
});

onUnmounted(() => {
  unlistenFns.forEach((fn) => fn());
});
</script>

<style lang="scss">
@import "./styles/css/normalize.css";
@import "./styles/scss/theme.scss";

#app {
  color: rgba(0, 0, 0, 0.65);
}

.page-newtab {
  display: flex;
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.container {
  flex: 1;
}

/* scrollbar styles */
::-webkit-scrollbar {
  width: 4px;
  height: 8px;
}

::-webkit-scrollbar-button:start,
::-webkit-scrollbar-button:end {
  display: none;
}

::-webkit-scrollbar-track-piece {
  -webkit-border-radius: 0;
  background-color: rgba(0, 0, 0, 0);
}

::-webkit-scrollbar-thumb {
  width: 50px;

  -webkit-border-radius: 8px;
  outline: 1px solid #ccc;
  background-color: rgba(0, 0, 0, 0.3);
}

::-webkit-scrollbar-thumb:hover {
  background-color: #999999;
}
</style>
