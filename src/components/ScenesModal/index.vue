<template>
  <a-modal
    title="Scenes"
    :visible="scenesModalVisible"
    :footer="null"
    @cancel="onCancel"
  >
    <div class="editable-scenes">
      <div
        class="scene-item-wrap"
        v-for="(item, index) in scenes"
        :key="item.id"
      >
        <a-tag
          v-if="item.id !== editingSid"
          :closable="item.id > 0 && item.id !== CONST.DB.TEMPLATE_SID"
          @close="() => onSceneDelClick(item, index)"
          @click.native="startEdit(item)"
          >{{ item.name }}</a-tag
        >
        <a-input
          v-else
          ref="input"
          type="text"
          size="small"
          :style="{ width: '59px' }"
          :value="item.name"
          @blur="onSceneItemConfirm($event, item)"
          @keyup.enter="onSceneItemConfirm($event, item)"
        />
      </div>
      <div class="scene-item-wrap">
        <a-tag
          v-if="!newSceneVisible"
          style="background: #fff; borderstyle: dashed"
          @click="newSceneVisible = true"
        >
          <PlusOutlined /> New
        </a-tag>
        <a-input
          v-else
          ref="input"
          type="text"
          size="small"
          :style="{ width: '78px' }"
          v-model:value="newSceneName"
          @blur="onNewSceneItemConfirm"
          @keyup.enter="onNewSceneItemConfirm"
        />
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { mapGetters } from "vuex";
import CONST from "../../constant";
import * as dictController from "../../server/controller/dictController";
import { DictModel } from "../../server/model/Dict";
import { useAppStore } from "../../store";
import { EditableScene } from "../../store/modules/types";
import { PlusOutlined } from "@ant-design/icons-vue";

const store = useAppStore();
const newSceneVisible = ref(false);
const newSceneName = ref("");
const scenesModalVisible = computed(() => store.state.Note.scenesModalVisible);
const scenes = computed(() => store.state.Note.scenes);
const editingSid = computed(() => store.state.Note.editingSid);

function onCancel() {
  store.dispatch("hideScenesModal");
}

async function onSceneDelClick(item: EditableScene, index: number) {
  await dictController.del(item.id);
  scenes.value.splice(index, 1);
  store.commit("SET_SCENES", scenes.value.slice(0));
  store.commit("SET_SHOULD_SYNC", true);
}

function onSceneItemConfirm(val: string, item: EditableScene) {
  store.dispatch("exitEditingScene");
  dictController.update({
    id: item.id,
    name: item.name,
  });
}

async function onNewSceneItemConfirm() {
  const text = newSceneName.value.trim();

  if (text) {
    const id = dictController.put({
      name: text,
      parentId: 1,
    });
    const newList = [...scenes.value, { id, name: text }];
    store.commit("SET_SCENES", newList);
    store.commit("SET_SHOULD_SYNC", true);
  }

  newSceneName.value = "";
  newSceneVisible.value = false;
}

function startEdit(item: EditableScene) {
  store.commit("SET_EDITING_SID", item.id);
}
</script>

<style lang="scss">
@import "../../styles/css/normalize.css";
@import "../../styles/scss/theme.scss";

.editable-scenes {
  display: flex;
  flex-wrap: wrap;

  .scene-item-wrap {
    margin-bottom: 5px;

    .ant-tag {
      font-size: 14px;
      padding: 0 10px;
    }

    .ant-input {
      margin-right: 8px;
    }
  }
}
</style>
