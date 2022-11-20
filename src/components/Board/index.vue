<template>
  <div class="column">
    <div class="tit">
      <CheckSquareOutlined
        v-if="icon === 'check-square'"
        :type="icon"
        :class="[iconClass]"
      />
      <BookOutlined v-if="icon === 'book'" :type="icon" :class="[iconClass]" />
      <SyncOutlined v-if="icon === 'sync'" :type="icon" :class="[iconClass]" />
      <PushpinOutlined
        v-if="icon === 'pushpin'"
        :type="icon"
        :class="[iconClass]"
      />
      {{ title }}
    </div>
    <div class="list-wrap" :class="[listClass]">
      <div class="list">
        <div
          class="item"
          v-for="item in list"
          :key="item.id"
          @click="onItemClick(item)"
        >
          <template v-if="textField === 'content'">
            <div class="item-name">{{ item.content }}</div>
            <div class="item-info"></div>
          </template>
          <div v-if="textField === 'html'" v-html="item.html"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, PropType } from "vue";
import {
  CheckSquareOutlined,
  BookOutlined,
  SyncOutlined,
  PushpinOutlined,
} from "@ant-design/icons-vue";
import { EditableAnswer } from "../../server/model/Answer";
import { EditableQuestion, QuestionModel } from "../../server/model/Question";

defineProps({
  title: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
  },
  iconClass: {
    type: String,
    default: "",
  },
  list: {
    type: Array as PropType<Array<EditableAnswer | EditableQuestion>>,
    default: () => [],
  },
  listClass: {
    type: String,
    default: "",
  },
  onItemClick: {
    type: Function,
    default: () => {},
  },
  textField: {
    type: String,
    default: "content",
  },
});
</script>

<style lang="scss">
@import "../../styles/css/normalize.css";
@import "../../styles/scss/theme.scss";

.column {
  width: 22%;
  background: #eff1f3;
  border-radius: 6px;
  border: 1px solid #e1e4e8;

  .tit {
    text-align: center;
    height: 50px;
    line-height: 50px;
    font-weight: 500;
    color: #000;
  }
}

.list-wrap {
  height: 650px;
  padding: 8px;
  padding-top: 0;
  overflow: auto;
}

.item {
  margin: 8px 0;
  background: #fff;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  box-shadow: 0 1px 0 rgba(27, 31, 35, 0.04);
  padding: 8px;
  cursor: pointer;
}

.list-wrap {
  p {
    margin-bottom: 0;
  }
}
</style>
