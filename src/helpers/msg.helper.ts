import { MSG_TYPE } from "../enum";

export function getMsgTypeByText(msg: string) {
  if (/[?？]$/.test(msg)) {
    return MSG_TYPE.QUESTION;
  } else if (msg === "---") {
    return MSG_TYPE.SPLIT;
  } else {
    return MSG_TYPE.ANSWER;
  }
}

export function getMsgType(msg: string, type: string | number) {
  if (typeof type === "number") {
    return type;
  } else {
    return getMsgTypeByText(msg);
  }
}

export function getToggledMsgType(type: number) {
  if (type === MSG_TYPE.QUESTION) {
    return MSG_TYPE.ANSWER;
  } else if (type === MSG_TYPE.ANSWER) {
    return MSG_TYPE.QUESTION;
  } else {
    return type;
  }
}
