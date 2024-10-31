import path from "path";
import { app, dialog, ipcMain } from "electron";
import appState from "../../app-state";
import WindowBase from "../window-base";
import FramelessWindow from "../frameless";
import axiosInst from "../../../lib/axios-inst/main";
import qs from "qs";

class PrimaryWindow extends WindowBase {
  constructor() {
    // 调用WindowBase构造函数创建窗口
    super({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
    });

    // 拦截close事件
    this._browserWindow?.on("close", (e) => {
      if (!appState.allowExitApp) {
        this._browserWindow?.webContents.send("show-close-primary-win-msgbox");
        e.preventDefault();
      }
    });

    this.openRouter("/primary");
  }

  protected registerIpcMainHandler(): void {
    ipcMain.on("message", (event, message) => {
      if (!this.isIpcMainEventBelongMe(event)) return;

      console.log(message);
    });

    ipcMain.on("show-frameless-sample-window", (event) => {
      if (!appState.framelessWindow?.valid) {
        appState.framelessWindow = new FramelessWindow();
      }

      const win = appState.framelessWindow?.browserWindow;
      if (win) {
        // 居中到父窗体中
        const parent = win.getParentWindow();
        if (parent) {
          const parentBounds = parent.getBounds();
          const x = Math.round(
            parentBounds.x + (parentBounds.width - win.getSize()[0]) / 2
          );
          const y = Math.round(
            parentBounds.y + (parentBounds.height - win.getSize()[1]) / 2
          );

          win.setPosition(x, y, false);
        }
        win.show();
      }
    });

    function delay(time) {
      return new Promise((resolve) => setTimeout(resolve, time));
    }

    ipcMain.on("min-to-tray", (event) => {
      if (!this.isIpcMainEventBelongMe(event)) return;

      this.browserWindow?.hide();

      if (appState.tray) {
        appState.tray.displayBalloon({
          title: "electron-vue-boilerplate",
          content: "客户端已经最小化到系统托盘!",
        });
      }
    });

    ipcMain.handle("async-exit-app", async (event) => {
      // 暂停1500毫秒，模拟退出程序时的清理操作
      await delay(1500);
      appState.allowExitApp = true;
      app.quit();
    });

    ipcMain.on("http-get-request", async (event, url): Promise<any> => {
      const data = qs.stringify({
        phone: "13603999887",
      });

      const res = await axiosInst.get(url, {
        headers: {
          v: "0.67214105019480621730172981051",
          "X-Requested-With": "XMLHttpRequest",
          Cookie:
            "appName=PDCENTERASIAINFO; mg_uem_user_id_c497fe63beeb41f3b95dac50d4357d5c=226e84a8-78a8-4c76-a0ea-34dcaab21c7d; cookieId=b2oRZ6Npu8_Zh_PYvKRvIurhkk9PLfG1726716232528; JSESSIONID=D82D2D7818364C64A8CCB0089B186558; TOKEN=C3FF296C9AC24ECA83206E921FF317B2",
          "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        data,
      });
      console.log("请求结果", res.data);
      return res.data;
    });
  }
}

export default PrimaryWindow;
