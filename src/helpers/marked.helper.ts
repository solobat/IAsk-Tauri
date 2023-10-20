import { marked } from "marked";
import hljs from "./highlight.helper";
import TaskRender from "../extensions/marked.task";
import { LRUCache } from "lru-cache";

marked.setOptions({
  highlight: function (code, language) {
    const validLanguage = hljs.getLanguage(language) ? language : "plaintext";

    return hljs.highlight(validLanguage, code).value;
  },
});

marked.use({ renderer: TaskRender });

const cache = new LRUCache({
  max: 500,
});
export function parseMarkdown(content = "") {
  const text = content.trim();

  if (text) {
    if (cache.has(text)) {
      return cache.get(text);
    } else {
      const html = marked(text);
      cache.set(text, html);

      return html;
    }
  } else {
    return "";
  }
}
