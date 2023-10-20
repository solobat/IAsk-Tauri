<template>
  <a-modal
    :visible="settingsModalVisible"
    :footer="null"
    @change="onModalChange"
  >
    <a-tabs>
      <a-tab-pane key="general" tab="通用">
        <a-form>
          <a-form-item
            label="默认折叠对话"
            :label-col="{ span: 7 }"
            :wrapper-col="{ span: 12 }"
          >
            <a-switch
              :checked="config.general.defaultFoldAll"
              @change="saveConfigKey($event, 'general', 'defaultFoldAll')"
            />
          </a-form-item>
        </a-form>
      </a-tab-pane>
      <a-tab-pane key="shortcuts" tab="快捷键">
        <a-form>
          <a-form-item
            label="发送消息"
            :label-col="{ span: 7 }"
            :wrapper-col="{ span: 12 }"
          >
            <a-select
              :value="config.shortcuts.sendMessage"
              @change="saveConfigKey($event, 'shortcuts', 'sendMessage')"
            >
              <a-select-option key="1" value="return">Return</a-select-option>
              <a-select-option key="2" value="shiftReturn"
                >Shift+Return</a-select-option
              >
            </a-select>
          </a-form-item>
        </a-form>
      </a-tab-pane>
      <a-tab-pane key="sync" tab="同步">
        <a-form>
          <a-form-item
            label="WebDav URL"
            :label-col="{ span: 7 }"
            :wrapper-col="{ span: 12 }"
          >
            <a-input :value="webdavURL" :readonly="true">
              <CloseCircleOutlined
                class="btn-rmwebdav"
                @click="onRmWebdavClick"
                slot="suffix"
              />
            </a-input>
          </a-form-item>
          <a-form-item
            label="同步频率"
            :label-col="{ span: 7 }"
            :wrapper-col="{ span: 12 }"
          >
            <a-select
              :value="config.sync.interval"
              @change="saveConfigKey($event, 'sync', 'interval')"
            >
              <a-select-option
                v-for="(opt, index) in CONST.BASE.SYNC_INTERVAL_OPTIONS"
                :key="index"
                :value="opt.value"
                >{{ opt.label }}</a-select-option
              >
            </a-select>
          </a-form-item>
          <a-form-item
            label="变更时自动同步"
            :label-col="{ span: 7 }"
            :wrapper-col="{ span: 12 }"
          >
            <a-switch
              v-model:checked="config.sync.autoSync"
              @change="saveConfigKey($event, 'sync', 'autoSync')"
            >
            </a-switch>
          </a-form-item>
        </a-form>
      </a-tab-pane>
    </a-tabs>
  </a-modal>
</template>

<script setup lang="ts">
import { mapState, mapActions, mapGetters } from "vuex";
import {
  getConfig,
  saveConfig,
  restoreConfig,
  getDefaultConfig,
  NativeConfigKey,
} from "../../helpers/config.helper";
import {
  saveData,
  isWebDavConfiged,
  initClientWithConfig,
  saveConfig as saveWebDavConfig,
  createDataSyncTick,
  getWebDavURL,
  removeWebDavConfig,
} from "../../helpers/webdav.helper";
import { CloseCircleOutlined } from "@ant-design/icons-vue";
import CONST from "../../constant";
import { MyIcon } from "../../helpers/icon.helper";
import { computed, watch } from "vue";
import { useAppStore } from "../../store";
import { message } from "ant-design-vue";
import { emitter } from "../../helpers/emitter.helper";

const webDavRules = {
  url: [{ required: true, message: "请输入 WebDav URL" }],
  username: [{ required: true, message: "请输入 WebDav username" }],
  password: [{ required: true, message: "请输入 WebDav password" }],
};
const store = useAppStore();
const config = computed(() => store.state.Config);
const settingsModalVisible = computed(
  () => store.state.App.settingsModalVisible
);
const webdavURL = computed(() => store.state.App.webdavURL);
watch(config, () => {
  console.log(config.value);
});

async function saveConfigKey(val: any, key: NativeConfigKey, subKey: string) {
  await saveConfig(key, { [subKey]: val });
  store.dispatch("loadConfig");
}

function onRmWebdavClick() {
  removeWebDavConfig();
  emitter.emit("sync:stop");
  store.dispatch("refreshWebdavURL");
  message.info("WebDav 配置已清除，你可以点击「同步」图标重新设置");
}

function onModalChange(val: any) {
  store.commit("SET_SETTINGS_MODAL", val);
}
</script>

<style lang="scss">
@import "../../styles/css/normalize.css";
@import "../../styles/scss/theme.scss";

.btn-rmwebdav {
  cursor: pointer;
}
</style>
