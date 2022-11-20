import Dexie from "dexie";
import CONST from "../../constant";
import STORAGE from "../../constant/storage";
import { AnswerModel } from "../model/Answer";
import { DictModel } from "../model/Dict";
import { QuestionModel } from "../model/Question";

interface Schema {
  [tableName: string]: string | null;
}

const DB_NAME = CONST.DB.DB_NAME;
const MIN_VERSION = CONST.DB.MIN_VERSION;
const version = Number(localStorage.getItem(CONST.STORAGE.DB_VERSION)) || 1;
const hasDB = localStorage.getItem(CONST.STORAGE.DB_VERSION) !== null;
const schema: Schema = {
  question:
    "++id,tags,content,createTime,updateTime,[deleted+archived],sid,sticky",
  answer: "++id,[qid+deleted],type,content,status,createTime,updateTime",
  dict: "++id,[parentId+deleted],name,createTime,updateTime",
};
export class IAskDatabase extends Dexie {
  question!: Dexie.Table<QuestionModel, number>;
  answer!: Dexie.Table<AnswerModel, number>;
  dict!: Dexie.Table<DictModel, number>;

  constructor() {
    super("iask", { autoOpen: true });

    this.version(1).stores(schema);
  }
}

export const db = new IAskDatabase();

async function changeSchema(db: Dexie, schemaChanges: Schema) {
  db.close();
  const newDb = new Dexie(db.name);

  newDb.on("blocked", () => false);

  if (db.tables.length === 0) {
    await db.delete();

    newDb.version(MIN_VERSION).stores(schemaChanges);

    return await newDb.open();
  }

  const currentSchema = db.tables.reduce((result, { name, schema }) => {
    result[name] = [
      schema.primKey.src,
      ...schema.indexes.map((idx) => idx.src),
    ].join(",");
    return result;
  }, {} as { [key: string]: any });

  newDb.version(db.verno).stores(currentSchema);

  const newVerno = db.verno + 1;

  localStorage.setItem(STORAGE.DB_VERSION, String(newVerno));
  newDb.version(newVerno).stores(schemaChanges);

  return await newDb.open();
}

async function dbUpdate() {
  let db = new Dexie(DB_NAME);

  if (!(await Dexie.exists(db.name))) {
    console.log("Db does not exist");
  }

  await db.open();

  db = await changeSchema(db, schema);
}

export async function checkDB() {
  if (hasDB && version < MIN_VERSION) {
    console.log("db should update...");
    await dbUpdate();

    window.location.reload();
  } else {
    console.log("checkDB -> hasDB", hasDB);
    db.version(MIN_VERSION).stores(schema);
    localStorage.setItem(CONST.STORAGE.DB_VERSION, String(MIN_VERSION));
  }
}
