<template>
  <a-modal
    title="WebDav"
    :visible="webdavModalVisible"
    @change="onModalChange"
    @ok="onWebDavFormOk"
  >
    <a-form>
      <a-form-item
        label="WebDav URL"
        :label-col="{ span: 7 }"
        :wrapper-col="{ span: 12 }"
      >
        <a-input v-model:value="webDavForm.url" />
      </a-form-item>
      <a-form-item
        label="User Name"
        :label-col="{ span: 7 }"
        :wrapper-col="{ span: 12 }"
      >
        <a-input v-model:value="webDavForm.username" />
      </a-form-item>
      <a-form-item
        label="Password"
        :label-col="{ span: 7 }"
        :wrapper-col="{ span: 12 }"
      >
        <a-input v-model:value="webDavForm.password" type="password" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { computed } from "@vue/reactivity";
import { message } from "ant-design-vue";
import { reactive } from "vue";
import { mapState, mapActions, mapGetters } from "vuex";
import { emitter } from "../../helpers/emitter.helper";
import {
  saveData,
  isWebDavConfiged,
  initClientWithConfig,
  saveConfig as saveWebDavConfig,
  createDataSyncTick,
  getWebDavURL,
  removeWebDavConfig,
} from "../../helpers/webdav.helper";
import { useAppStore } from "../../store";

const webDavForm = reactive({
  url: "",
  username: "",
  password: "",
});
const store = useAppStore();
const webdavModalVisible = computed(() => store.state.App.webdavModalVisible);
function onModalChange(val: any) {
  store.commit("SET_WEBDAV_MODAL", val);
}

function onWebDavFormOk() {
  const { url, username, password } = webDavForm;

  if (url && username && password) {
    const config = { url, username, password };

    initClientWithConfig(config)
      .then(() => {
        saveWebDavConfig(config);
        message.success("配置成功");
        store.commit("SET_WEBDAV_MODAL", false);
        store.dispatch("refreshWebdavURL");
        emitter.emit("sync:start");
      })
      .catch(() => {
        message.warning("配置失败，请检查表单内容");
      });
  } else {
    message.warning("请完善表单内容");
  }
}
</script>

<style></style>
