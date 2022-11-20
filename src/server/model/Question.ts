export interface QuestionModel {
  id: number;
  tags: string;
  content: string;
  sid: number;
  sticky?: number;
  createTime?: number;
  updateTime?: number;
  archived?: number;
  deleted?: number;
}

export type EditableQuestion = QuestionModel & {
  menuVisible?: boolean;
  html?: string;
};
