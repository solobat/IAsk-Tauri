export const ACTIONS = {
  LIST_SHORTCUTS: "listShortcuts",
  PREVIEW_MARKDOWN: "previewMarkdown",
  TOGGLE_FOLD_ALL_DIALOGS: "toggleFoldAllDialogs",
  SETTINGS_PANEL: "setttingsPanel",
};

const allConfigs = [
  {
    label: "列出键盘快捷方式",
    id: ACTIONS.LIST_SHORTCUTS,
    values: [
      {
        platform: "win",
        showValue: ["⌃", "/"],
        value: ["ctrl", "/"],
      },
      {
        platform: "mac",
        showValue: ["⌘", "/"],
        value: ["command", "/"],
      },
    ],
  },
  {
    label: "切换所有对话的折叠状态",
    id: ACTIONS.TOGGLE_FOLD_ALL_DIALOGS,
    values: [
      {
        platform: "win",
        showValue: ["⌃", "⇧", "f"],
        value: ["ctrl", "shift", "f"],
      },
      {
        platform: "mac",
        showValue: ["⌘", "⇧", "f"],
        value: ["shift", "command", "f"],
      },
    ],
  },
  {
    label: "设置面板",
    id: ACTIONS.SETTINGS_PANEL,
    values: [
      {
        platform: "win",
        showValue: ["⌃", ","],
        value: ["ctrl", ","],
      },
      {
        platform: "mac",
        showValue: ["⌘", ","],
        value: ["command", ","],
      },
    ],
  },
];

const utils = {
  isMac() {
    return navigator.platform.startsWith("Mac");
  },
  isWin() {
    return navigator.platform.startsWith("Win");
  },
  isLinux() {
    return navigator.platform.startsWith("Linux");
  },
  getSystem() {
    if (utils.isMac()) {
      return "mac";
    } else if (utils.isWin()) {
      return "win";
    } else if (utils.isLinux()) {
      return "linux";
    } else {
      return "linux";
    }
  },
};

function getKeybordsConfigs() {
  const sys = utils.getSystem();
  const list = allConfigs
    .map((config) => {
      const { label, id, values } = config;
      const value = values.find((item) => item.platform === sys);

      return {
        label,
        id,
        ...value,
      };
    })
    .filter((item) => Boolean(item.value));

  return list;
}

export const keyboardConfigs = getKeybordsConfigs();
