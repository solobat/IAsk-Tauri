import mitt from "mitt";

type Events = {
  editMsg: void;
  updateScroll: void;
  "sync:start": void;
  "sync:stop": void;
  "import:done": void;
};
export const emitter = mitt<Events>();
