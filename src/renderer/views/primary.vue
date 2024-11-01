<template>
  <div class="container">
    <div class="top">
      <a-button @click="getData(1)"> 请求数据 </a-button>
      <a-button @click="getData(2)"> 请求数据1 </a-button>

      <a-button @click="onOpenDevTools"> 调试工具 </a-button>
    </div>
    <div class="mid-view">
      <a-form :model="formData" name="basic" autocomplete="off">
        <a-form-item label="手机号" name="mobile">
          <a-input v-model:value="formData.mobile" />
        </a-form-item>
        <a-form-item label="输入文件">
          <a-input
            v-model:value="formData.inputFilePath"
            placeholder="选择输入文件"
            readonly
          />
          <a-button @click="selectInputFile">选择文件</a-button>
        </a-form-item>

        <a-form-item label="输出位置">
          <a-input
            v-model:value="formData.outputFilePath"
            placeholder="选择输出位置"
            readonly
          />
          <a-button @click="selectOutputFile">选择输出位置</a-button>
        </a-form-item>
      </a-form>
    </div>
    <div class="result-view">{{ result }}</div>
  </div>
  <a-modal
    :open="showClosePrimaryWinMsgbox"
    title="警告"
    @ok="onMinPrimaryWinToTray"
    @cancel="showClosePrimaryWinMsgbox = false"
  >
    <template #footer>
      <a-button key="minimize" type="primary" @click="onMinPrimaryWinToTray">
        最小化
      </a-button>
      <a-button key="exit-app" :loading="isExitingApp" @click="onExitApp">
        退出
      </a-button>
    </template>
    <p>退出客户端软件将导致功能不可用，建议您最小化到系统托盘！</p>
  </a-modal>
</template>

<script setup lang="ts">
  import { ref, reactive } from "vue";
  import log from "electron-log/renderer";
  import HelloWorld from "../components/hello-world.vue";
  import { message, Form } from "ant-design-vue";
  import fd from "@file-download/renderer";
  import * as fdTypes from "@file-download/shared";
  import utils from "@utils/renderer";
  import { GetErrorMessage } from "@utils/shared";
  import axiosInst from "@lib/axios-inst/renderer";

  //   var qs = require('qs');

  const activeKey = ref<number>(1);
  const showExitAppMsgbox = ref<boolean>(false);
  const showClosePrimaryWinMsgbox = ref<boolean>(false);
  const isExitingApp = ref<boolean>(false);
  const formData = reactive({
    mobile: "13603999887",
    inputFilePath: "",
    outputFilePath: "",
  });
  const result = ref(null);

  async function selectInputFile() {
    const filePaths = await utils.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "All Files", extensions: ["*"] }],
    });
    const filePathList = filePaths.filePaths;
    if (filePathList && filePathList.length > 0) {
      formData.inputFilePath = filePathList[0];
      console.log("选择的文件路径", formData.inputFilePath);
    }
  }
  async function selectOutputFile() {
    const filePath = await utils.showOpenDialog({
      properties: ["openDirectory"],
    });
    const filePathList = filePath.filePaths;
    if (filePathList && filePathList.length > 0) {
      formData.outputFilePath = filePathList[0];
      console.log("选择的文件路径", formData.inputFilePath);
    }
  }
  async function getData(type) {
    const resData = await utils.getRequestData({
      url: "https://wg.ha.chinamobile.com:20000/ngwbcontrol/BGBUSI/getCustomerCharacter",
      mobile: formData.mobile,
      inputFilePath: formData.inputFilePath,
      outputFilePath: formData.outputFilePath,
    });
    console.log("请求的结果-----------", resData);
    result.value = resData;
  }
  function getElectronApi() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).primaryWindowAPI;
  }

  // 与文件下载相关的数据和状态
  interface FileDownloadState {
    url: string;
    savePath: string;
    md5: string;
    downloading: boolean;
    uuid: string;
    percent: number;
  }

  const fdState = reactive<FileDownloadState>({
    url: "https://dldir1.qq.com/qqfile/qq/QQNT/bc30fb5d/QQ9.9.7.21217_x86.exe",
    savePath: "QQ9.9.7.21217_x86.exe",
    md5: "BC30FB5DB716D56012C8F0ECEE65CA20",
    downloading: false,
    uuid: "",
    percent: 0,
  });

  // 发送消息到主进程
  getElectronApi().sendMessage("Hello from App.vue!");

  // 当主进程通知显示退出程序前的消息弹窗时触发
  getElectronApi().onShowExitAppMsgbox(() => {
    showExitAppMsgbox.value = true;
  });

  // 当主进程通知显示关闭主窗口前的消息弹窗时触发
  getElectronApi().onShowClosePrimaryWinMsgbox(() => {
    showClosePrimaryWinMsgbox.value = true;
  });

  // 打印日志到文件
  log.info("Log from the renderer process(App.vue)!");

  // 显示当前客户端的环境（开发、测试、生产）
  function onShowAppEnv() {
    message.success(`当前环境为：${import.meta.env.MODE}`);
  }

  // 演示如何获取其他环境变量
  function onShowOtherEnv() {
    message.success(`BaseUrl: ${import.meta.env.VITE_BASE_URL}`);
  }

  function onShowFramelessWindow() {
    // 通知主进程显示无边框示例窗口
    getElectronApi().showFramelessSampleWindow();
  }

  function onOpenHomepage() {
    // 调用utils模块的方法打开外链
    utils.openExternalLink(
      "https://github.com/winsoft666/electron-vue3-boilerplate"
    );
  }

  // 打开当前窗口的调试工具
  function onOpenDevTools() {
    utils.openDevTools();
  }

  // 获取应用版本号并显示
  function onGetAppVersion() {
    message.success(utils.getAppVersion());
  }

  async function onGetFileMd5() {
    // 打开文件选择对话框
    const result = await utils.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "All Files", extensions: ["*"] }],
    });

    if (result.filePaths.length > 0) {
      // 计算文件MD5
      utils
        .getFileMd5(result.filePaths[0])
        .then((md5) => {
          message.success(md5);
        })
        .catch((e) => {
          message.error(GetErrorMessage(e));
        });
    }
  }

  // 开始下载文件
  async function onStartDownloadFile() {
    // 文件下载选项
    const options = new fdTypes.Options();
    options.url = fdState.url;
    options.savePath = fdState.savePath;
    options.skipWhenMd5Same = true;
    options.verifyMd5 = !!fdState.md5;
    options.md5 = fdState.md5;
    options.feedbackProgressToRenderer = true;

    fdState.downloading = true;
    fdState.uuid = options.uuid;
    fdState.percent = 0;

    const result: fdTypes.Result = await fd.download(
      options,
      (uuid: string, bytesDone: number, bytesTotal: number) => {
        // 文件下载进度反馈
        fdState.percent = Math.floor((bytesDone * 100) / bytesTotal);
      }
    );

    fdState.downloading = false;
    if (result.success) {
      message.success(
        `[${result.uuid}] 文件下载成功 (大小: ${result.fileSize})!`
      );
    } else if (result.canceled) {
      message.warning(`[${result.uuid}] 用户取消！`);
    } else {
      message.error(`[${result.uuid}] 下载失败: ${result.error}!`);
    }
  }

  // 取消文件下载
  async function onCancelDownloadFile() {
    fd.cancel(fdState.uuid);
  }

  // 测试在主进程中使用axios进行HTTP请求
  function onHttpGetInMainProcess() {
    // getElectronApi().httpGetRequest("https://baidu.com");
  }

  // 测试在渲染进程中使用axios进行HTTP请求
  // 这一步在非打包环境会报跨域错误，打包或使用loadFile加载index.html后，就不会报错了
  function onHttpGetInRendererProcess() {
    const url = "/api";
    axiosInst
      .get(url)
      .then((rsp) => {
        message.info(`在渲染进程请求 ${url} 成功！状态码：${rsp.status}`);
      })
      .catch((err) => {
        message.error(`在渲染进程请求 ${url} 失败！错误消息：${err.message}`);
      });
  }

  async function onExitApp() {
    isExitingApp.value = true;
    await getElectronApi().asyncExitApp();
    isExitingApp.value = false;
    showExitAppMsgbox.value = false;
  }

  function onMinPrimaryWinToTray() {
    showClosePrimaryWinMsgbox.value = false;
    getElectronApi().minToTray();
  }
</script>

<style lang="less" scoped>
  .container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    user-select: text;
    .top {
      margin-bottom: 20px;
    }
    .mid-view {
      width: 80%;
    }
    .result-view {
    }
    //     padding: 20px;
    //     display: flex;
    //     justify-content: center;
    //     align-items: center;
    //     flex-direction: column
    //   .top {
    //     }
    //   }
    // .exit-msg-title {
    // }
    // p {
    // }
  }
</style>
