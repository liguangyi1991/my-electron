const xlsx = require('xlsx');
import axiosInst from "../../axios-inst/main";
import qs from "qs";
const dayjs = require('dayjs');

const path = require('path');
// import { testData } from "./data.js"
const testData = require("./data.js")
console.log('导入的数据', testData)
const BATCH_SIZE = 10; // 每批处理的手机号数量
const CONCURRENT_LIMIT = 5; // 最大并发请求数
const DELAY_BETWEEN_BATCHES = 1000; // 每批之间的延时，单位：毫秒
export function readPhoneNumbersFromExcel(filePath) {
  console.log('Reading phone numbers from Excel...');
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]]; // 选择第一个工作表
  const data = xlsx.utils.sheet_to_json(sheet);
  return data.map(row => row['手机号']); // 假设列名为“手机号”
}


export async function fetchPhoneDetailsBatch(phoneNumbers) {
  const results = [];
  for (let i = 0; i < phoneNumbers.length; i += BATCH_SIZE) {
    const batch = phoneNumbers.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${i / BATCH_SIZE + 1}...`);

    // 限制并发请求数量
    const batchResults = await Promise.all(batch.map((phone, index) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(fetchPhoneDetail(phone));
        }, index * 200); // 间隔200ms来分散并发请求
      });
    }));

    results.push(...batchResults);

    // 在处理下一批之前延时
    if (i + BATCH_SIZE < phoneNumbers.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }
  return results;
}
async function fetchPhoneDetail(phone) {
  try {
    const data = qs.stringify({
      phone: phone,
    });
    // const res = await axiosInst.post(form.url, data, {
    //   headers: {
    //     v: "0.67214105019480621730172981051",
    //     "X-Requested-With": "XMLHttpRequest",
    //     Cookie:
    //       "appName=PDCENTERASIAINFO; mg_uem_user_id_c497fe63beeb41f3b95dac50d4357d5c=226e84a8-78a8-4c76-a0ea-34dcaab21c7d; cookieId=b2oRZ6Npu8_Zh_PYvKRvIurhkk9PLfG1726716232528; JSESSIONID=463174554DE14CEC2B1D7261A619E9C2; TOKEN=5A3DB6FD952C41DB81D7D654BB4E7BE8",
    //     "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
    //     "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    //   },
    // });
    // return { phone, result: res.data };
    const list =  testData.data.object.data.wrTagList
    
    return Promise.resolve({ phone, ...handelData(list) })
  } catch (error) {
    console.error(`Error fetching details for phone ${phone}:`, error.message);
    return { phone, result: '解析失败' };
  }
}
// 4. 将结果写入新的 Excel 文件
export function writeResultsToExcel(results, outputFilePath) {
  const worksheet = xlsx.utils.json_to_sheet(results);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, '解析结果');

  xlsx.writeFile(workbook, outputFilePath);
  console.log(`Results written to ${outputFilePath}`);
}


export async function processPhoneNumbers(inputFilePath, outputFilePath) {
  const phoneNumbers = readPhoneNumbersFromExcel(inputFilePath);
  const results = await fetchPhoneDetailsBatch(phoneNumbers);
  writeResultsToExcel(results, generateOutputFilePath(outputFilePath));
}

function generateOutputFilePath(outputDir) {
  const timestamp = dayjs().format('YYYY-MM-DD-HH-mm-ss'); // 使用 dayjs 格式化时间戳
  const fileName = `解析结果_${timestamp}.xlsx`; // 拼接文件名
  return path.join(outputDir, fileName); // 将文件夹路径和文件名组合成完整路径
}

function handelData(list) {
  const restult = {}
  for(let item of list)
  {
    if(item.key == 'last3MonthsAveMOU')
    {
      // 近3个月月均MOU(分钟)
      restult[item.keyName] = item.keyValue
    }else if(item.key == 'last3MonthsAveARPU'){
      // 近3个月月均ARPU(元
      restult[item.keyName] = item.keyValue
    }else if(item.key == 'last3MonthsAveDOU'){
      // 近3个月月均ARPU(元
      restult[item.keyName] = item.keyValue
    }else if(item.key == 'cardsNum'){
      // 近3个月月均ARPU(元
      restult[item.keyName] = item.keyValue
    }
  }
  return restult

}