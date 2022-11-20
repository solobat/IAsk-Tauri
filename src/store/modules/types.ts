import { AnswerModel, EditableAnswer } from "../../server/model/Answer";
import { DictModel } from "../../server/model/Dict";
import { QuestionModel } from "../../server/model/Question";

export interface AppState {
  settingsModalVisible: boolean;
  webdavModalVisible: boolean;
  shortcutsModalVisible: boolean;
  shouldSync: boolean;
  webdavURL: string;
}

export type EditableScene = DictModel & { onedit?: boolean };

export interface NoteState {
  scenesModalVisible: boolean;
  qaddVisible: boolean;
  curQid: number;
  curSid: number;
  qkeyword: string;
  scenes: EditableScene[];
  questions: QuestionModel[];
  editingMsg: EditableAnswer | null;
  editingSid: number;
  newAnswerText: string;
  qLoading: boolean;
  imgPreview: string;
  aid: number;
}

export interface ConfigState {
  general: {
    defaultFoldAll: boolean;
  };
  shortcuts: {
    sendMessage: string;
  };
  sync: {
    interval: number;
    autoSync: boolean;
  };
}

export interface RootState {
  App: AppState;
  Note: NoteState;
  Config: ConfigState;
}
