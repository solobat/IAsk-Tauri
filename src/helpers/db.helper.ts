import { db } from "../server/db";
import dayjs from "dayjs";
import { downloadAsJSON, downloadAsText } from "./file.helper";
import {
  exportToJsonString,
  importFromJsonString,
  clearDatabase,
} from "./indexdb.helper";
import { reject } from "lodash";

export async function exportAndDownload() {
  return new Promise((resolve, reject) => {
    exportToJsonString(db.backendDB(), (err, str: string) => {
      if (!err) {
        downloadAsJSON(str)
          .then(() => {
            resolve(true);
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  });
}

export function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onabort = (ev) => reject(new Error("file read aborted"));
    reader.onerror = (event: any) => reject(event.target.error);
    reader.onload = (event: any) => resolve(event.target.result);
    reader.readAsText(blob);
  });
}

export async function exportAsJson(): Promise<string> {
  return new Promise((resolve, reject) => {
    exportToJsonString(db.backendDB(), (err, str: string) => {
      if (!err) {
        resolve(str);
      } else {
        reject(err);
      }
    });
  });
}

function convert2Markdown(info: any = {}) {
  const { data } = info;

  if (data && data.length) {
    const [questions, answers] = data;

    const qitems = questions.rows.reduce((memo: any, item: any) => {
      const { id, content, createTime, tags } = item;
      memo[id] = {
        content: `
---
**${content}**
- date: ${dayjs(createTime).format("YYYY/MM/DD HH:mm")}
- tags: ${tags || ""}
        `,
      };

      return memo;
    }, {});
    answers.rows.forEach((item: any) => {
      const { qid, content } = item;
      const qitem = qitems[qid];

      if (qitem) {
        qitem.content += `
${content}
        `;
      }
    });

    return Object.values(qitems).reduce((memo, item: any) => {
      memo += `
${item.content}


`;
      return memo;
    }, "");
  } else {
    return "";
  }
}

export async function exportAsMarkdown() {
  return exportAsJson().then((obj: any) => {
    if (obj) {
      const md: any = convert2Markdown(JSON.parse(obj).data);

      downloadAsText(md, "IAsk-export.md");
    }
  });
}

function formatJSON(json: any) {
  if (json.formatName && json.formatName === "dexie") {
    return json;
  } else {
    return json;
  }
}

export async function importDBFile(json: string) {
  return new Promise((resolve) => {
    clearDatabase(db.backendDB(), () => {
      importFromJsonString(db.backendDB(), json, (err: any) => {
        if (!err) {
          resolve(true);
        } else {
          reject(err);
        }
      });
    });
  });
}
