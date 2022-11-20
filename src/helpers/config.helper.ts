import { Store } from "tauri-plugin-store-api";

const store = new Store(".settings");

export function getDefaultConfig() {
  return {
    general: {
      defaultFoldAll: false,
    },
    shortcuts: {
      sendMessage: "return",
    },
    sync: {
      interval: 60 * 1000,
      autoSync: false,
    },
  };
}

export type NativeConfig = ReturnType<typeof getDefaultConfig>;
export type NativeConfigKey = keyof NativeConfig;
export type NativeConfigValue = Partial<NativeConfig[NativeConfigKey]>;

function mapStoredConfig(config: Array<[string, any]>) {
  return config.reduce((conf, item) => {
    const [key, value] = item;
    conf[key] = {
      ...conf[key],
      ...value,
    };

    return conf;
  }, {} as Record<string, any>) as NativeConfig;
}

export async function getConfig() {
  const config = await store.entries();
  const result = mapStoredConfig(config);

  return result;
}

export function restoreConfig() {
  return Promise.resolve(getDefaultConfig());
}

export async function saveConfig(
  key: NativeConfigKey,
  value: NativeConfigValue
) {
  await store.set(key, value);
}
