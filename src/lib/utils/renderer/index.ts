/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @file 当前目录的代码只能被渲染进程所使用
 */

import { OpenDialogOptions, OpenDialogReturnValue } from "electron";

class Utils {
  public openDevTools() {
    (window as any).__ElectronUtils__.openDevTools();
  }

  public openExternalLink(url: string) {
    (window as any).__ElectronUtils__.openExternalLink(url);
  }

  public async showOpenDialog(
    options: OpenDialogOptions
  ): Promise<OpenDialogReturnValue> {
    return (await (window as any).__ElectronUtils__.showOpenDialog(
      options
    )) as OpenDialogReturnValue;
  }

  public checkPathExist(path: string): boolean {
    return (window as any).__ElectronUtils__.checkPathExist(path) as boolean;
  }

  public async getFileMd5(filePath: string): Promise<string> {
    return (await (window as any).__ElectronUtils__.getFileMd5(
      filePath
    )) as string;
  }

  public getAppVersion(): string {
    return (window as any).__ElectronUtils__.getAppVersion() as string;
  }

  public async testName() {
    return await (window as any).__ElectronUtils__.testName();
  }
  public async getRequestData(form, callback) {
    return await (window as any).__ElectronUtils__.getRequestData(form,callback);
  }
  public onSendhandlestatu(callback){
    (window as any).__ElectronUtils__.onSendhandlestatu(callback);
  }
  // === FALG LINE (DO NOT MODIFY/REMOVE) ===
}

const utils = new Utils();

export default utils;
