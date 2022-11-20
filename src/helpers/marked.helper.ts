import { marked } from "marked";
import hljs from "./highlight.helper";
import TaskRender from "../extensions/marked.task";

marked.setOptions({
  highlight: function (code, language) {
    const validLanguage = hljs.getLanguage(language) ? language : "plaintext";

    return hljs.highlight(validLanguage, code).value;
  },
});

marked.use({ renderer: TaskRender });

export function parseMarkdown(content = "") {
  const text = content.trim();

  if (text) {
    return marked(text);
  } else {
    return "";
  }
}
