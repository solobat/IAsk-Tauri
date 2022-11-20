import { db } from "../db";
import { AnswerModel } from "../model/Answer";
import { list as queryMsgList, update as updateMsg } from "./answerController";

export function list() {
  return db.question
    .where({
      deleted: 0,
      archived: 0,
    })
    .toArray();
}

export async function update(obj: { [keyPath: string]: any }) {
  const { id, ...attrs } = obj;

  return db.question.update(id, attrs).then(() => {
    if (attrs.archived === 1) {
      return afterQuestionArchived(id);
    }
  });
}

async function afterQuestionArchived(qid: number) {
  const messages = await queryMsgList(qid);
  const tasks = messages.map((item) => {
    return updateMsg({
      id: item.id,
      deleted: 1,
    });
  });

  return Promise.all(tasks);
}

export async function save(
  attrs: {
    [keyPath: string]: any;
  },
  templateId: number
) {
  const { content } = attrs;
  const result = await db.question.get({
    content,
    deleted: 0,
    archived: 0,
  });

  if (result) {
    return db.question.update(result.id, attrs);
  } else {
    return db.question
      .put({
        ...attrs,
        archived: 0,
        deleted: 0,
        sticky: 0,
      } as any)
      .then(async (res) => {
        if (templateId) {
          await createMsgByTemplateId(res, templateId);
        }

        return res;
      });
  }
}

export async function detail(id: number) {
  const result = await db.question.get(id);

  return result;
}

async function createMsgByTemplateId(qid: number, templateId: number) {
  const msgs = await queryMsgList(templateId);

  if (msgs.length) {
    const items = msgs.map(({ content, type }) => {
      return {
        content,
        qid,
        deleted: 0,
        type: 0,
        status: 0,
        updateTime: Number(new Date()),
        createTime: Number(new Date()),
      };
    });

    return db.answer.bulkPut(items as AnswerModel[]);
  }
}

export function query() {
  return db.question.toArray();
}

export function del(id: number) {
  return db.question.delete(id);
}
