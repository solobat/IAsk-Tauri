import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "./highlight.helper";
import TaskRender from "../extensions/marked.task";
import { LRUCache } from "lru-cache";

const marked = new Marked(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
    async: false,
  })
);
marked.use({ renderer: TaskRender });

const cache = new LRUCache<string, string>({
  max: 500,
});
export function parseMarkdown(content = "") {
  const text = content.trim();

  if (text) {
    if (cache.has(text)) {
      return cache.get(text);
    } else {
      const html = marked.parse(text) as string;
      cache.set(text, html);

      return html;
    }
  } else {
    return "";
  }
}
