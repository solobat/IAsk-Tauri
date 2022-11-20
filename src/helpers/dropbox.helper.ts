import Dropbox from "dropbox";
import CONST from "../constant";
import dayjs from "dayjs";

const CLIENT_ID = "dr3x2jsihvj4lo9";

export function getAccessTokenFromUrl() {
  const hash = location.hash;

  if (hash.startsWith("#")) {
    const usp = new URLSearchParams(hash.substr(1));

    return usp.get("access_token");
  } else {
    return "";
  }
}

const KEY = CONST.STORAGE.DROPBOX_ACCESS_TOKEN;

export function saveAcessToken(val: string) {
  localStorage.setItem(KEY, val);
}

export function getAccessToken() {
  return localStorage.getItem(KEY) ?? undefined;
}

export function isAuthenticated() {
  return !!getAccessToken();
}

export function fileUpload(data = JSON.stringify({})) {
  return new Promise((resolve) => {
    doWithAuth((dbx) => {
      if (dbx) {
        const task = dbx.filesUpload({
          contents: data,
          path: `/IAsk.config.${dayjs().format("YYYY_MM_DD")}.json`,
          mode: {
            ".tag": "overwrite",
          },
        });

        resolve(task);
      } else {
        resolve("正在请求授权...");
      }
    });
  });
}

export async function openAuth() {
  const dbx = new Dropbox.DropboxAuth({
    clientId: CLIENT_ID,
    fetch: fetch,
  });
  const authUrl = await dbx.getAuthenticationUrl("callback.html");

  window.open(authUrl.toString());
}

export const doWithAuth = (callback: (dbx: Dropbox.Dropbox | null) => void) => {
  if (isAuthenticated()) {
    const dbx = new Dropbox.Dropbox({
      accessToken: getAccessToken(),
      fetch: fetch,
    });

    return callback(dbx);
  } else {
    openAuth();

    return callback(null);
  }
};

export function auth() {
  if (isAuthenticated()) {
    const dbx = new Dropbox.Dropbox({
      accessToken: getAccessToken(),
      fetch: fetch,
    });
    dbx
      .filesListFolder({ path: "" })
      .then(function (response) {
        console.log("response", response);
      })
      .catch(function (error) {
        console.error(error);
      });
  } else {
    const dbx = new Dropbox.DropboxAuth({ clientId: CLIENT_ID, fetch: fetch });
    dbx.getAuthenticationUrl("callback.html").then((authUrl) => {
      window.open(authUrl.toString());
    });
  }
}
