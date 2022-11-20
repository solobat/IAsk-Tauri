<template>
  <div class="page-note">
    <Sidebar v-show="sidebarVisible" />
    <ScenesModal />
    <QuestionAddModal />
    <ChatBox />
    <ImgPreviewModal />
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import Sidebar from "../components/Sidebar/index.vue";
import ScenesModal from "../components/ScenesModal/index.vue";
import QuestionAddModal from "../components/QuestionAddModal/index.vue";
import ChatBox from "../components/ChatBox/index.vue";
import ImgPreviewModal from "../components/ImgPreviewModal/index.vue";

const sidebarVisible = ref(true);
</script>
<style lang="scss">
@import "../styles/css/normalize.css";
@import "../styles/scss/theme.scss";

.page-note {
  display: flex;
}

.q-options-popup {
  .ant-popover-arrow {
    display: none;
  }

  .ant-popover-inner {
    background: #efefef;
    padding: 5px 0;
  }

  .ant-popover-inner-content {
    padding: 0;
  }
}

.q-options {
  .q-options-menu {
    background: #efefef;
  }
  .q-option {
    width: 120px;
    font-size: 14px;
    padding: 3px 0 3px 15px;
    cursor: pointer;

    &:hover {
      color: #fff;
      background: $color-primary;
    }
  }
}

.ant-menu-submenu-popup,
.ant-menu-submenu > .ant-menu {
  background: #efefef !important;
}

.ant-menu-submenu-popup {
  max-height: 50vh;
  overflow: hidden;

  &:hover {
    overflow: auto;
  }
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
