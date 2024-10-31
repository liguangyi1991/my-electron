/**
 * @file 当前目录的代码只能被主进程所使用
 */
import {
  app,
  session,
  BrowserWindow,
  ipcMain,
  shell,
  dialog,
  OpenDialogOptions,
} from "electron";
import path from "path";
import * as FileUtils from "./file-util";
import appState from "../../../main/app-state";
import axiosInst from "../../axios-inst/main";
import qs from "qs";

class Utils {
  public initialize() {
    this._preloadFilePath = path.join(__dirname, "utils-preload.js");
    // console.log("Utils preload path: " + this._preloadFilePath);
    this.setPreload(session.defaultSession);

    app.on("session-created", (session) => {
      this.setPreload(session);
    });
  }

  protected setPreload(session) {
    session.setPreloads([...session.getPreloads(), this._preloadFilePath]);
  }

  protected _preloadFilePath: string = "";

  // === PUBLIC METHOD FALG LINE (DO NOT MODIFY/REMOVE) ===
}

const utils = new Utils();

ipcMain.on("electron-utils-open-dev-tools", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    win.webContents.openDevTools();
  }
});

ipcMain.on("electron-utils-open-external-url", (event, url) => {
  if (url) {
    shell.openExternal(url);
  }
});

ipcMain.handle(
  "electron-utils-show-open-dialog",
  async (event, options: OpenDialogOptions) => {
    return await dialog.showOpenDialog(options);
  }
);

ipcMain.on("electron-utils-check-path-exist", (event, path) => {
  let exist = false;
  if (path) {
    exist = FileUtils.IsPathExist(path);
  }
  event.returnValue = exist;
});

ipcMain.handle("electron-utils-get-file-md5", async (event, filePath) => {
  return await FileUtils.GetFileMd5(filePath);
});

ipcMain.on("electron-utils-get-app-version", (event) => {
  event.returnValue = appState.appVersion;
});

ipcMain.handle("electron-utils-test-name", async (event) => {});
ipcMain.handle(
  "electron-utils-get-request-data",
  async (event, url, mobile: string) => {
    try {
      const data = qs.stringify({
        phone: mobile,
      });

      const res = await axiosInst.post(url, data, {
        headers: {
          v: "0.67214105019480621730172981051",
          "X-Requested-With": "XMLHttpRequest",
          Cookie:
            "appName=PDCENTERASIAINFO; mg_uem_user_id_c497fe63beeb41f3b95dac50d4357d5c=226e84a8-78a8-4c76-a0ea-34dcaab21c7d; cookieId=b2oRZ6Npu8_Zh_PYvKRvIurhkk9PLfG1726716232528; JSESSIONID=D82D2D7818364C64A8CCB0089B186558; TOKEN=C3FF296C9AC24ECA83206E921FF317B2",
          "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      });
      console.log("测试", res);
      return res.data;
    } catch (error) {
      console.log(error);
    }
  }
);
// === FALG LINE (DO NOT MODIFY/REMOVE) ===

export default utils;
export { FileUtils };
