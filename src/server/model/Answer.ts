export interface AnswerModel {
  id: number;
  qid: number;
  type: number;
  content: string;
  status: number;
  createTime?: number;
  updateTime?: number;
  archived?: number;
  deleted?: number;
}

export type EditableAnswer = AnswerModel & {
  time?: string;
  shouldHide?: boolean;
  menuVisible?: boolean;
  html?: string;
  folded?: boolean;
  onedit?: boolean;
};
