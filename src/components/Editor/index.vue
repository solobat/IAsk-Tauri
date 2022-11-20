<template>
  <div class="chatbox-input" :class="{ 'is-fold': isFold }">
    <mavon-editor
      v-model="value"
      :toolbars="editorToolbars"
      :subfield="false"
      :boxShadow="false"
      :tabSize="2"
      ref="editor"
      placeholder=" "
      previewBackground="#f3f4f5"
      toolbarsBackground="#f3f4f5"
      class="ipt"
      :editable="!isFold"
      @imgAdd="onImgAdd"
      @keydown.native.meta.enter.exact="onMetaEnterDown"
      @keydown.native.enter.exact="onEnterDown"
      @keydown.native.esc="onEscDown"
    >
      <template #right-toolbar-after>
        <div class="right-toolbar-before">
          <CaretUpOutlined v-if="isFold" @click="onFoldBtnClick" />
          <CaretDownOutlined v-else="isFold" @click="onFoldBtnClick" />
        </div>
      </template>
    </mavon-editor>
    <div class="bottom-bar">
      <div class="key-tips">
        <span v-if="sendMessage === 'commandReturn'"
          >↩换行 / ⌘+↩{{ btnText }}</span
        >
        <span v-else>↩{{ btnText }} / ⌘+↩换行</span>
      </div>
      <a-button
        v-if="type === 'edit'"
        style="margin-right: 10px"
        @click="onCancelClick"
        >取消</a-button
      >
      <a-button @click="onSendClick">{{ btnText }}</a-button>
      <a-tooltip>
        <template slot="title"> 作为问题 </template>
        <a-switch
          v-model:checked="sendAsQuestion"
          size="small"
          class="as-question"
        />
      </a-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { message } from "ant-design-vue";
import { text } from "stream/consumers";
import {
  ref,
  defineProps,
  reactive,
  PropType,
  computed,
  watch,
  defineEmits,
} from "vue";
import { mapGetters } from "vuex";
import { uploadImg } from "../../helpers/upload.helper";
import { CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons-vue";
import { useAppStore } from "../../store";

const emit = defineEmits<{
  (event: "send", content: string, sendAsQuestion: boolean): void;
  (evnet: "cancel"): void;
}>();
const props = defineProps({
  content: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "create",
  },
});
const value = ref(props.content ?? "");
const sendAsQuestion = ref(false);
const isFold = ref(false);
const editorToolbars = reactive({
  bold: true, // 粗体
  italic: true, // 斜体
  header: true, // 标题
  underline: true, // 下划线
  strikethrough: true, // 中划线
  mark: true, // 标记
  superscript: true, // 上角标
  subscript: true, // 下角标
  quote: true, // 引用
  ol: true, // 有序列表
  ul: true, // 无序列表
  link: true, // 链接
  imagelink: true, // 图片链接
  code: true, // code
  table: true, // 表格
  fullscreen: true, // 全屏编辑
  htmlcode: false, // 展示html源码
  undo: true, // 上一步
  redo: true, // 下一步
  alignleft: true, // 左对齐
  aligncenter: true, // 居中
  alignright: true, // 右对齐
  subfield: false, // 单双栏模式
  preview: true, // 预览
});
const store = useAppStore();
const sendMessage = computed(() => store.getters.sendMessage);
const btnText = computed(() => {
  if (props.type === "create") {
    return "发送";
  } else if (props.type === "edit") {
    return "编辑";
  }
});
watch(
  () => props.content,
  (text) => {
    value.value = text;
  }
);
const editor = ref<any>(null);
function onImgAdd(pos: any, file: File) {
  uploadImg(file)
    .then((data) => {
      editor.value!.$img2Url(pos, data.url);
      message.success("上传成功");
    })
    .catch(() => {
      message.error("上传失败");
    });
}

function onEnterDown(event: any) {
  if (sendMessage.value === "return") {
    event.preventDefault();
    onSendClick();
  }
}

function onMetaEnterDown() {
  if (sendMessage.value === "commandReturn") {
    onSendClick();
  }
}
function onSendClick() {
  const content = value.value.trim();

  emit("send", content, sendAsQuestion.value);
  sendAsQuestion.value = false;
  value.value = "";
}

function cancel() {
  if (props.type === "edit") {
    emit("cancel");
  }
  editor.value.$el.querySelector("textarea").blur();
}

function onCancelClick() {
  cancel();
}

function onEscDown() {
  if (props.type === "edit") {
    cancel();
  }
}

function onFoldBtnClick() {
  isFold.value = !isFold.value;
}
</script>

<style lang="scss">
@import "../../styles/css/normalize.css";
@import "../../styles/scss/theme.scss";

.right-toolbar-before {
  display: inline-block;
  color: #757575;

  .anticon {
    cursor: pointer;
  }
}

.chatbox-input {
  display: flex;
  flex-direction: column;
  position: relative;
  padding-bottom: 20px;
  border-top: 1px solid $border-color;
  height: 370px;

  &.is-fold {
    height: 43px;
  }

  .ipt {
    flex: 1;
    background: inherit;
    outline: none;
    border: none;
  }
}

.bottom-bar {
  margin-top: 5px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 16px;

  .key-tips {
    margin-right: 18px;
    color: $color-light;
  }
}

.v-note-wrapper {
  z-index: 999 !important;

  &.fullscreen {
    background: $background-color !important;

    .v-left-item {
      padding-left: 70px !important;
    }
  }
}

.content-input-wrapper,
.content-input {
  background-color: inherit !important;
}

.content-input-wrapper {
  padding: 0 16px 15px 16px !important;
}

.content-input {
  pre,
  textarea {
    background-color: inherit !important;
  }
}

.as-question {
  margin-left: 5px;
}
</style>
