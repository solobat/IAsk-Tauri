import { db } from "../db";
import { getMsgType } from "../../helpers/msg.helper";
import { STATUS_TYPE } from "../../enum";
import { AnswerModel } from "../model/Answer";

export function list(qid: number) {
  return db.answer
    .where({
      qid,
      deleted: 0,
    })
    .sortBy("createTime");
}

export function allList() {
  return db.answer
    .where({
      type: 0,
      deleted: 0,
    })
    .toArray();
}

export async function update(obj: { id: number; [keyPath: string]: any }) {
  const { id, ...attrs } = obj;

  return db.answer.update(id, attrs);
}

export async function put(attrs: { [keyPath: string]: any }) {
  return db.answer.put({
    updateTime: Number(new Date()),
    createTime: Number(new Date()),
    ...attrs,
    deleted: 0,
    type: getMsgType(attrs.content, attrs.type),
    status: STATUS_TYPE.UNRESOLVED,
  } as any);
}

export function query() {
  return db.answer.toArray();
}

export function del(id: number) {
  return db.answer.delete(id);
}
