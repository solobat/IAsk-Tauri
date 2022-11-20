import { db } from "../db";
import { getMsgType } from "../../helpers/msg.helper";
import { STATUS_TYPE } from "../../enum";
import DB from "../../constant/db";
import { DictModel } from "../model/Dict";

export function list(parentId = 1) {
  return db.dict
    .where({
      parentId,
      deleted: 0,
    })
    .reverse()
    .sortBy("updateTime");
}

export async function update(obj: { [keyPath: string]: any }) {
  const { id, ...attrs } = obj;

  return db.dict.update(id, {
    ...attrs,
    updateTime: Number(new Date()),
  });
}

export async function put(attrs: { [keyPath: string]: any }) {
  return db.dict.put({
    ...attrs,
    deleted: 0,
    updateTime: Number(new Date()),
    createTime: Number(new Date()),
  } as any);
}

export function query() {
  return db.dict.toArray();
}

export function del(id: number) {
  return db.dict.delete(id);
}

function initDicts() {
  const dicts = [
    {
      parentId: 0,
      deleted: 0,
      name: "scene",
      createTime: Number(new Date()),
      updateTime: Number(new Date()),
    },
    {
      parentId: 1,
      deleted: 0,
      name: "工作",
      createTime: Number(new Date()),
      updateTime: Number(new Date()),
    },
    {
      parentId: 1,
      deleted: 0,
      name: "编程",
      createTime: Number(new Date()),
      updateTime: Number(new Date()),
    },
    {
      parentId: 1,
      deleted: 0,
      name: "投资",
      createTime: Number(new Date()),
      updateTime: Number(new Date()),
    },
    {
      parentId: 1,
      deleted: 0,
      name: "真理",
      createTime: Number(new Date()),
      updateTime: Number(new Date()),
    },
  ];
  return db.dict.bulkPut(dicts as DictModel[]);
}

function initTemplate() {
  const dicts = [
    {
      parentId: 1,
      deleted: 0,
      name: "模板",
      id: DB.TEMPLATE_SID,
      createTime: Number(new Date()),
      updateTime: Number(new Date()),
    },
  ];
  return db.dict.bulkPut(dicts);
}

export function initDictsIfNeeded() {
  return list(0).then((items) => {
    if (!items.length) {
      return initDicts();
    } else {
      const template = items.find((item) => item.id === DB.TEMPLATE_SID);
      if (!template) {
        initTemplate();
      }
    }
  });
}
