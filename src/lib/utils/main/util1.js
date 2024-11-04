const ExcelJS = require('exceljs');
const fs = require('fs');
const testData = require("./data.js")
const dayjs = require('dayjs');
const path = require('path');

class ExcelParser {
  constructor(inputFilePath, outputFilePath) {
    this.inputFilePath = inputFilePath;
    this.outputFilePath = outputFilePath;
    this.workbookRead = new ExcelJS.Workbook();
    this.workbookWrite = null;
    this.worksheetWrite = null;
  }

  async initializeWriter() {
    const options = {
      filename: this.outputFilePath,
      useStyles: true,
      useSharedStrings: true
    };

    this.workbookWrite = new ExcelJS.stream.xlsx.WorkbookWriter(options);
    this.worksheetWrite = this.workbookWrite.addWorksheet('Sheet1');

  }

  async parse() {
    try {
      const readStream = fs.createReadStream(this.inputFilePath);

      // 使用流模式加载 Excel 文件
      await this.workbookRead.xlsx.read(readStream);

      // 获取第一个工作表
      const worksheetRead = this.workbookRead.getWorksheet(1);

      // 创建一个存储写入操作的 Promise 数组

      worksheetRead.eachRow({ includeEmpty: true }, async (row, rowNumber) => {
        if (rowNumber === 1) return; // 跳过第一行表头
        const mobile = row.values[1]; // 获取手机号
        const list = testData.data.object.data.wrTagList
        const resultDic = handelData(list)
        if (rowNumber == 2) {
          await this.worksheetWrite.addRow(['手机号', ...Object.keys(resultDic)])
        }


        // // 将写入操作添加到 Promise 数组中
        await this.worksheetWrite.addRow([mobile, ...Object.values(resultDic)])
      });
      await this.workbookWrite.commit()
      console.log('Excel file has been created successfully!');

    } catch (error) {
      console.log('错误', error)
    }

  }

  async process() {
    await this.initializeWriter();
    await this.parse();
  }
}



export async function processPhoneNumbers(inputFilePath, outputFilePath) {
  const excelParser = new ExcelParser(inputFilePath, generateOutputFilePath(outputFilePath));
  await excelParser.process();
  // form.callBack();
}

function generateOutputFilePath(outputDir) {
  const timestamp = dayjs().format('YYYY-MM-DD-HH-mm-ss'); // 使用 dayjs 格式化时间戳
  const fileName = `解析结果_${timestamp}.xlsx`; // 拼接文件名
  return path.join(outputDir, fileName); // 将文件夹路径和文件名组合成完整路径
}

function handelData(list) {
  const restult = {}
  for (let item of list) {
    if (item.key == 'last3MonthsAveMOU') {
      // 近3个月月均MOU(分钟)
      restult[item.keyName] = item.keyValue
    } else if (item.key == 'last3MonthsAveARPU') {
      // 近3个月月均ARPU(元
      restult[item.keyName] = item.keyValue
    } else if (item.key == 'last3MonthsAveDOU') {
      // 近3个月月均ARPU(元
      restult[item.keyName] = item.keyValue
    } else if (item.key == 'cardsNum') {
      // 近3个月月均ARPU(元
      restult[item.keyName] = item.keyValue
    }
  }
  return restult

}