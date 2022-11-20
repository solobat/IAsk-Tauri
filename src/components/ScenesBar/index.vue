<template>
  <div class="scenes-wrap">
    <div class="scene-list" ref="scenelist">
      <div
        class="scene-item"
        v-for="item in scenes"
        :key="item.id"
        :class="{
          'is-active': item.id === curSid,
          'is-template': item.id === CONST.DB.TEMPLATE_SID,
        }"
        @click="onSceneItemClick(item)"
      >
        {{ item.name }}
      </div>
      <div class="scene-holder"></div>
    </div>
    <div class="scene-item-more">
      <div class="list-shadow"></div>
      <div class="edit-btn" @click="onScenesEditClick">
        <edit-outlined />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, nextTick, ref, onMounted } from "vue";
import CONST from "../../constant";
import { useAppStore } from "../../store";
import { EditOutlined } from "@ant-design/icons-vue";
import { EditableScene } from "../../store/modules/types";

const store = useAppStore();
const curSid = computed(() => store.state.Note.curSid);
const scenes = computed(() => store.state.Note.scenes);
const validSids = computed(() => {
  return scenes.value.filter((item) => item.id > 0).map((item) => item.id);
});
const scenelist = ref<HTMLDivElement | null>(null);

watch(
  () => store.state.Note.curSid,
  (val) => {
    nextTick(() => {
      updateSceneScroll();
    });
  }
);

onMounted(() => {
  scenelist.value;
});

function updateSceneScroll() {
  const index = scenes.value.findIndex((item) => item.id === curSid.value);
  const list = scenelist;
  const nodes = list?.value?.children || [];
  const elem = nodes[index - 1] as HTMLDivElement;

  if (elem) {
    list?.value?.scrollTo(elem.offsetLeft, 0);
  }
}

function onSceneItemClick(item: EditableScene) {
  const sid = item.id;

  if (curSid.value !== sid) {
    store.commit("SET_CURRENT_SID", sid);
    window.localStorage.setItem(CONST.STORAGE.SID, String(sid));
  }
}

function onScenesEditClick() {
  store.dispatch("showScenesModal");
}
</script>

<style lang="scss">
@import "../../styles/css/normalize.css";
@import "../../styles/scss/theme.scss";

.scenes-wrap {
  position: relative;
  border-bottom: 1px solid $border-color;

  .scene-item {
    width: 62px;
    min-width: 62px;
    line-height: 40px;
    text-align: center;
    font-size: 14px;
    cursor: pointer;
    color: $color-light;
    user-select: none;

    &.is-active {
      color: $color-primary;
      font-size: 15px;
    }

    &.is-template {
      color: #faad14;
    }
  }

  .scene-holder {
    min-width: 48px;
    height: 40px;
  }

  .scene-list {
    display: flex;
    height: 40px;
    overflow: auto;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .scene-item-more {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    background: #fff;

    .edit-btn {
      padding: 0 15px;
      line-height: 39px;
      cursor: pointer;
    }

    .list-shadow {
      position: absolute;
      top: 0;
      background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAABXCAQAAACjUt0DAAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAAAEgAAABIAEbJaz4AAAAJdnBBZwAAABIAAABXAK421QoAAAFiSURBVEjH1ZbbtoMgDERnKP//yaYPVSAhF077dHQtamU7k0RKAxwcPCF4ItF+tWMNsVZS91uJhNlRX7FGPMgizOrEObJSiZUUAnRkR6q0qnErm7Lhc9UDBaXUt0kN0FOaOo4SQ5BRCahOA3HT5KwTE50GZhV37VazJKYljjE2SE+sPsittC1XW/FmgNVsZJcvuhvrAbLqffNadPXLYgaLzs8wWSo6rk9FYdeBUW/x1DRswfS6ysuNlcDZ7ssTSCpIfDsZn/J8b+Omh8pjR/X8DkuWndwnINpOlukFbtvzVslAEmF+TCMaCC4fkr8oKUgVzmQ4IBojHfqFqwd28O0S6AXA7ib2P+HOTlzLcXZ3+tFz6yRObiOmGY+3k6ev5XN97Uq7FoCXkl5HTrT6tQiw2u1aY/TrZF551jyMFPZiOqW1O5zXiJx1PV/2Tw52tD8ddYc/9Zlq7qhBrlrtuhX/98cbycGBFpNaiv0AAAAldEVYdGRhdGU6Y3JlYXRlADIwMTQtMDItMjdUMTc6NDQ6NDErMDg6MDDFbrv7AAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE0LTAyLTI3VDE3OjQ0OjQxKzA4OjAwtDMDRwAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAAASUVORK5CYII=)
        no-repeat center right;
      background-size: contain;
      background-color: #fff;
      width: 20px;
      height: 39px;
      left: -20px;
    }
  }
}
</style>
