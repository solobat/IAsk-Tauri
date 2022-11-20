import { MSG_TYPE } from "../enum";
import { AnswerModel } from "../server/model/Answer";
import { QuestionModel } from "../server/model/Question";
import { writeTextFile, BaseDirectory } from "@tauri-apps/api/fs";

export function convertFile2Blob(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (e: ProgressEvent<FileReader>) {
      let blob = new Blob([new Uint8Array(e.target!.result as ArrayBuffer)], {
        type: file.type,
      });

      resolve(blob);
    };
    reader.onabort = function () {
      reject("onabort");
    };
    reader.onerror = function () {
      reject("onerror");
    };
    reader.readAsArrayBuffer(file);
  });
}

export function downloadURL(url: string, fileName = "img.png") {
  const elem = document.createElement("a");

  elem.setAttribute("href", url);
  elem.setAttribute("download", fileName);
  document.body.appendChild(elem);
  elem.click();

  elem.remove();
}

export function downloadAsText(text: string, fileName = "file.txt") {
  downloadAs(text, fileName);
}

export function downloadAs(
  text: string,
  fileName = "file.txt",
  textType = "plain"
) {
  let textContent = `data:text/${textType};charset=utf-8,`;

  let encodedUri = encodeURI(`${textContent}${text}`);

  downloadURL(encodedUri, fileName);
}

export async function downloadAsJSON(text: string, fileName = "file.json") {
  await writeTextFile(fileName, text, { dir: BaseDirectory.Download });
}

export function downloadQuestion(
  question: QuestionModel,
  answers: AnswerModel[]
) {
  const text = answers.reduce((memo, item) => {
    const { content, type } = item;

    if (type === MSG_TYPE.QUESTION) {
      memo += `
${content}
---
`;
    } else if (type === MSG_TYPE.ANSWER) {
      memo += `
${content}
`;
    }

    return memo;
  }, "");

  downloadAsText(text, `${question.content}.md`);
}
