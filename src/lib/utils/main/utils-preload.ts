import { contextBridge, ipcRenderer, OpenDialogOptions } from "electron";

function initialize() {
  if (!ipcRenderer) {
    return;
  }

  if (contextBridge && process.contextIsolated) {
    try {
      contextBridge.exposeInMainWorld("__ElectronUtils__", {
        openDevTools: () => ipcRenderer.send("electron-utils-open-dev-tools"),
        openExternalLink: (url: string) =>
          ipcRenderer.send("electron-utils-open-external-url", url),
        showOpenDialog: (options: OpenDialogOptions) =>
          ipcRenderer.invoke("electron-utils-show-open-dialog", options),
        checkPathExist: (path: string) =>
          ipcRenderer.sendSync("electron-utils-check-path-exist", path),
        getFileMd5: (filePath: string) =>
          ipcRenderer.invoke("electron-utils-get-file-md5", filePath),
        getAppVersion: () =>
          ipcRenderer.sendSync("electron-utils-get-app-version"),
        testName: () => ipcRenderer.invoke("electron-utils-test-name"),
        getRequestData: (form,callback) =>
        {
          const replyMessage =  ipcRenderer.invoke("electron-utils-get-request-data", form)
          console.log('replyMessage', replyMessage);
          callback(replyMessage)
        }
          ,
        onSendhandlestatu: (callback) => ipcRenderer.on("electron-utils-sendhandlestatu", (event) => {
          callback();
        }),
        // === FALG LINE (DO NOT MODIFY/REMOVE) ===
      });
    } catch {
      // Sometimes this files can be included twice
    }
  }
}

initialize();
