import {
  createClient,
  WebDAVClient,
  WebDAVClientOptions,
  FileStat,
  RequestOptions,
  getPatcher,
} from "webdav/web";
import { fetch, HttpVerb } from "@tauri-apps/api/http";
import dayjs from "dayjs";
import { exportAsJson, importDBFile } from "./db.helper";
import { getCuid } from "./cuid.helper";
import axios from "axios";
import axiosTauriApiAdapter from "axios-tauri-api-adapter";
const client = axios.create({ adapter: axiosTauriApiAdapter as any });

let webDavClient: WebDAVClient | null;

getPatcher().patch("request", (opts: RequestOptions) => client(opts as any));

function configClient(url: string, config: WebDAVClientOptions) {
  const { username, password } = config;
  const client = createClient(url, {
    username,
    password,
  });

  return client;
}

const WEBDAV_CONFIG_KEY = "webdav_config";

function restoreConfig() {
  const str = localStorage.getItem(WEBDAV_CONFIG_KEY);

  if (str) {
    try {
      return JSON.parse(str);
    } catch (error) {
      return;
    }
  } else {
    return null;
  }
}

export function removeWebDavConfig() {
  localStorage.removeItem(WEBDAV_CONFIG_KEY);
  webDavClient = null;
}

export function getWebDavURL() {
  const config = restoreConfig();

  if (config) {
    return config.url;
  } else {
    return "";
  }
}

export function isWebDavConfiged() {
  const config = restoreConfig();

  if (config) {
    return true;
  } else {
    return false;
  }
}

export function saveConfig(config: WebDAVClientOptions & { url: string }) {
  try {
    localStorage.setItem(WEBDAV_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {}
}

const ROOT_PATH = "/IAsk";

export async function initClientWithConfig({
  url,
  ...config
}: WebDAVClientOptions & { url: string }) {
  const client = configClient(url, config);

  try {
    if ((await client.exists(ROOT_PATH)) === false) {
      await client.createDirectory(ROOT_PATH);
    }

    webDavClient = client;

    return client;
  } catch (error) {
    return null;
  }
}

async function getClient() {
  if (webDavClient) {
    return webDavClient;
  } else {
    const config = restoreConfig();

    if (config) {
      return initClientWithConfig(config);
    } else {
      return Promise.reject("failed to init");
    }
  }
}

function getDataFullFileName(clientName = 'tauri') {
  const suffix = dayjs().format("YYYY-MM-DD");

  return `${ROOT_PATH}/iask-export_${suffix}_${getCuid()}_${clientName}.json`;
}

export async function saveData() {
  const client = await getClient();

  if (client) {
    try {
      const data = await exportAsJson();
      const name = getDataFullFileName();

      await client.putFileContents(name, data as string);
    } catch (error) {
      return Promise.reject(error);
    }
  } else {
    return Promise.reject("client init failed...");
  }
}

async function restoreData() {
  const client = await getClient();

  if (client) {
    const files = await client.getDirectoryContents(ROOT_PATH);

    return files || [];
  } else {
    return [];
  }
}

function parseFileName(name = "") {
  const [base, date, cuid] = name.split(".json")[0].split("_");

  return {
    base,
    date,
    cuid,
  };
}

function isCreatedBy(file: FileStat) {
  const info = parseFileName(file.basename);

  if (info.cuid === getCuid()) {
    return true;
  } else {
    return false;
  }
}

async function getFileContents(file: FileStat) {
  return await webDavClient!.getFileContents(file.filename, {
    format: "text",
  });
}

async function renameFileWithCuid(file: FileStat) {
  await webDavClient!.moveFile(file.filename, getDataFullFileName());
}

function sortAndFilterFiles(files: FileStat[], clientName = "tauri") {
  return files
    .filter((file) => file.filename.indexOf(clientName) > -1)
    .sort((a, b) =>
      Number(new Date(a.lastmod)) > Number(new Date(b.lastmod)) ? -1 : 1
    );
}

export async function createDataSyncTick(shouldSync: boolean) {
  const files = (await restoreData()) as FileStat[];
  const latest = sortAndFilterFiles(files)[0];

  if (latest) {
    if (isCreatedBy(latest)) {
      if (shouldSync) {
        await saveData();
      }

      return false;
    } else {
      const content = await getFileContents(latest);

      if (content) {
        await importDBFile(content as string);

        return true;
      } else {
        return false;
      }
    }
  } else {
    await saveData();

    return false;
  }
}
