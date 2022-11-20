<template>
  <a-modal
    :visible="qaddVisible"
    :closable="false"
    @ok="onAddOk"
    @cancel="onQaddCancel"
  >
    <div class="template-choose" v-if="curSid !== CONST.DB.TEMPLATE_SID">
      <a-select
        class="template-select"
        show-search
        v-model:value="templateId"
        :placeholder="templates.length ? '请选择模板' : '暂无可用的模板'"
        :disabled="!templates.length"
      >
        <a-select-option
          v-for="item in templates"
          :key="item.id"
          :value="item.id"
          >{{ item.content }}</a-select-option
        >
      </a-select>
    </div>
    <a-textarea
      autofocus
      v-model:value="newquestionText"
      placeholder="输入问题"
      @keydown.meta.enter="onAddOk"
    ></a-textarea>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from "vue";
import { mapGetters } from "vuex";
import * as questionController from "../../server/controller/questionController";
import CONST from "../../constant";
import { useAppStore } from "../../store";
import { QuestionModel } from "../../server/model/Question";
import { message } from "ant-design-vue";

const store = useAppStore();
const newquestionText = ref("");

const templateId = ref("");
const qaddVisible = computed(() => store.state.Note.qaddVisible);
const curSid = computed(() => store.state.Note.curSid);
const questions = computed(() => store.state.Note.questions);

const templates = computed(() => {
  if (qaddVisible.value) {
    return questions.value.filter((item) => item.sid === CONST.DB.TEMPLATE_SID);
  } else {
    return [];
  }
});

function onQaddCancel() {
  store.dispatch("hideQuestionAddModal");
}

function onAddOk() {
  const content = newquestionText.value.trim();

  if (content) {
    store.commit("SET_CURRENT_QID", -1);
    questionController
      .save(
        {
          content,
          sid: curSid,
          createTime: Number(new Date()),
          updateTime: Number(new Date()),
        },
        Number(templateId.value)
      )
      .then((res) => {
        store.commit("SET_CURRENT_QID", res);
        message.success("添加成功");
        store.dispatch("hideQuestionAddModal");
        newquestionText.value = "";
        store.dispatch("loadQuestions");
        store.commit("SET_SHOULD_SYNC", true);
      });
  } else {
    message.warning("不能为空");
  }
}
</script>

<style lang="scss">
@import "../../styles/css/normalize.css";
@import "../../styles/scss/theme.scss";

.template-choose {
  display: flex;
  margin-bottom: 10px;

  .template-select {
    flex: 1;
  }
}
</style>
