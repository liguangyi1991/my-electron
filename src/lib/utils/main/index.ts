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
import {
  processPhoneNumbers
} from "./util1";
const xlsx = require("xlsx");

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

  public sendhandlestatu(browserWindow: BrowserWindow | null){
    if(browserWindow){
      browserWindow.webContents.send("electron-utils-sendhandlestatu");
    }
  }
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
ipcMain.handle("electron-utils-get-request-data", async (event, form) => {
   await processPhoneNumbers(form.inputFilePath, form.outputFilePath);
  return '生成成功'
});
// === FALG LINE (DO NOT MODIFY/REMOVE) ===

export default utils;
export { FileUtils };
