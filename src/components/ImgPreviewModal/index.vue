<template>
  <a-modal
    :visible="modalVisible"
    :closable="true"
    @cancel="onCancel"
    :footer="null"
    width="80vw"
    :afterClose="onAfterClose"
  >
    <div class="preview-wrap" v-if="imgPreview">
      <img :src="imgPreview" alt="" class="img-preview" />
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed } from "@vue/reactivity";
import { ref, watch } from "vue";
import { useAppStore } from "../../store";

const store = useAppStore();
const modalVisible = ref(false);
const imgPreview = computed(() => store.getters.imgPreview);

watch(
  imgPreview,
  () => {
    modalVisible.value = imgPreview.value !== "";
  },
  { immediate: true }
);

function onAfterClose() {
  store.commit("SET_IMG_PREVIEW", "");
}

function onCancel() {
  modalVisible.value = false;
}
</script>

<style lang="scss">
@import "../../styles/css/normalize.css";
@import "../../styles/scss/theme.scss";

.img-preview {
  max-width: 100%;
  width: auto;
}
</style>
