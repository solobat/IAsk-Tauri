import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import store, { key } from "./store";
import { router } from "./router";
import "ant-design-vue/dist/antd.css";
import { initDictsIfNeeded } from "./server/controller/dictController";
import mavonEditor from "mavon-editor";
import "mavon-editor/dist/css/index.css";

const app = createApp(App);

store.dispatch("loadScenes");
store.dispatch("loadQuestions");

app.use(router).use(store, key).use(mavonEditor).mount("#app");

initDictsIfNeeded();
