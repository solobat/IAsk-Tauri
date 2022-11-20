<template>
  <div class="app-sidebar">
    <div class="app-logo">
      <img src="../../assets/svg/logo-white.svg" alt="" />
    </div>
    <div class="app-links">
      <router-link to="/dashboard" class="app-link">
        <dashboard-outlined />
      </router-link>
      <router-link to="/note" class="app-link">
        <message-outlined @click="onNoteLinkClick" />
      </router-link>
      <router-link to="/review" class="app-link">
        <eye-outlined />
      </router-link>
    </div>
    <div class="extra-bar">
      <a-tooltip placement="right">
        <template #title>
          <span>Export</span>
        </template>
        <div class="btn-wrap" @click="onExportClick">
          <export-outlined />
        </div>
      </a-tooltip>
      <a-upload
        name="file"
        accept="application/json"
        :showUploadList="false"
        :beforeUpload="onImportFileBeforeUpload"
      >
        <a-tooltip placement="right">
          <template #title>
            <span>Import</span>
          </template>
          <div class="btn-wrap">
            <upload-outlined />
          </div>
        </a-tooltip>
      </a-upload>
      <a-tooltip placement="right">
        <template slot="title">
          <span>Sync</span>
        </template>
        <div class="btn-wrap" @click="onSyncClick">
          <cloud-sync-outlined :class="syncIconClass" />
        </div>
      </a-tooltip>
      <a-tooltip placement="right">
        <template #title>
          <span>Shortcuts</span>
        </template>
        <div class="btn-wrap" @click="onShortcutsClick">
          <my-icon type="icon-shortcuts" />
        </div>
      </a-tooltip>

      <a-tooltip placement="right">
        <template slot="title">
          <span>Settings</span>
        </template>
        <div class="btn-wrap" @click="onSettingsClick">
          <setting-outlined />
        </div>
      </a-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, defineComponent, onMounted } from "vue";
import { mapState, mapActions, mapGetters, useStore } from "vuex";
import throttle from "lodash/throttle";
import CONST from "../../constant";
import {
  exportAndDownload,
  importDBFile,
  exportAsJson,
  exportAsMarkdown,
  readBlob,
} from "../../helpers/db.helper";
import {
  convertFile2Blob,
  downloadAsText,
  downloadQuestion,
} from "../../helpers/file.helper";
import { MyIcon } from "../../helpers/icon.helper";
import { saveConfig } from "../../helpers/config.helper";
import {
  isWebDavConfiged,
  createDataSyncTick,
} from "../../helpers/webdav.helper";
import AppEventMixin from "../../mixins/appEvent.mixin";
import { db } from "../../server/db";
import { message } from "ant-design-vue";
import {
  ExportOutlined,
  DashboardOutlined,
  EyeOutlined,
  MessageOutlined,
  UploadOutlined,
  CloudSyncOutlined,
  SettingOutlined,
} from "@ant-design/icons-vue";
import { FileType } from "ant-design-vue/lib/upload/interface";
import { key } from "../../store";
import { emitter } from "../../helpers/emitter.helper";
import { computed } from "@vue/reactivity";

const loading = ref(true);
const syncStatus = ref(CONST.BASE.SYNC_STATUS.WAIT);
let syncTimer = 0;
const syncIconStyle = reactive({
  color: "#fff",
});
const store = useStore(key);
const shortcutsModalVisible = computed(
  () => store.state.App.shortcutsModalVisible
);
const interval = computed(() => store.state.Config.sync.interval);
const shouldSync = computed(() => store.state.App.shouldSync);
const webdavModalVisible = computed(() => store.state.App.webdavModalVisible);
const settingsModalVisible = computed(
  () => store.state.App.settingsModalVisible
);
const syncIconClass = computed(() => `icon-status-${syncStatus.value}`);

function onNoteLinkClick() {}

function onExportClick() {
  exportAndDownload()
    .then(() => {
      message.success("导出成功");
    })
    .catch((error) => {
      message.error("导出失败");
    });
}

function setup() {
  emitter.on("sync:start", startSync);
  emitter.on("sync:stop", stopSync);
}

function onImportFileBeforeUpload(file: FileType) {
  convertFile2Blob(file)
    .then(readBlob)
    .then(importDBFile)
    .then((blob) => {
      message.success("导入成功");
      emitter.emit("import:done");
    })
    .catch((err) => {
      message.error("导入失败");
    });

  return false;
}

const startSync = throttle(async function () {
  stopSync();
  syncStatus.value = CONST.BASE.SYNC_STATUS.BEGIN;
  await runDataSyncTick();

  syncTimer = window.setInterval(async () => {
    await runDataSyncTick();
  }, interval.value);
}, CONST.BASE.WEBDAV_MIN_SYNC_INTERVAL);

async function runDataSyncTick() {
  try {
    const shouldUpdate = await createDataSyncTick(shouldSync.value);

    store.commit("SET_SHOULD_SYNC", false);
    if (shouldUpdate) {
      emitter.emit("import:done");
    }
    syncStatus.value = CONST.BASE.SYNC_STATUS.SUCCESS;
  } catch (error) {
    console.log(error);
    syncStatus.value = CONST.BASE.SYNC_STATUS.FAIL;
  }
}

function onSyncClick() {
  if (isWebDavConfiged()) {
    startSync();
  } else {
    store.commit("SET_WEBDAV_MODAL", !webdavModalVisible.value);
  }
}

function stopSync() {
  clearInterval(syncTimer);
  syncStatus.value = CONST.BASE.SYNC_STATUS.WAIT;
}

function onShortcutsClick() {
  store.commit("SET_SHORTCUTS_MODAL", !shortcutsModalVisible.value);
}

function onSettingsClick() {
  store.commit("SET_SETTINGS_MODAL", !settingsModalVisible.value);
}

function init() {
  store.dispatch("loadConfig");
  tryStartSync();
  setup();
}

function tryStartSync() {
  if (isWebDavConfiged()) {
    startSync();
  }
}

onMounted(() => {
  init();
});
</script>

<style lang="scss">
@import "../../styles/css/normalize.css";
@import "../../styles/scss/theme.scss";

.app-sidebar {
  position: relative;
  background: $color-primary;
  width: 80px;
  min-width: 80px;
  height: 100vh;
  user-select: none;
  -webkit-app-region: drag;
}

.app-logo {
  margin: 40px auto 0;
  width: 40px;
  height: 40px;

  img {
    display: block;
    width: 100%;
    height: 100%;
  }
}

.app-links {
  margin-top: 30px;
}

.app-link {
  display: block;
  margin-top: 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 25px;

  &.router-link-active {
    color: #fff;
  }
}

.extra-bar {
  position: absolute;
  bottom: 80px;
  width: 100%;
  text-align: center;

  .btn-wrap {
    margin-top: 10px;
    padding: 5px;
    cursor: pointer;
  }

  .anticon {
    font-size: 18px;
    color: #fff;
    opacity: 0.7;

    &:hover {
      opacity: 1;
    }
  }
}

.anticon-cloud-sync {
  &.icon-status-begin {
    color: #fff;
    transition: color 400ms;
    animation: syncani 400ms infinite;
  }

  &.icon-status-success {
    color: #30ed69;
  }

  &.icon-status-fail {
    color: #ff8f8f;
  }
}

@keyframes syncani {
  0% {
    color: #fff;
  }

  100% {
    color: #30ed69;
  }
}
</style>
