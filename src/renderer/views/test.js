var axios = require('axios');
var qs = require('qs');
var data = qs.stringify({
   'phone': '13603999887' 
});
var config = {
   method: 'post',
   url: 'https://wg.ha.chinamobile.com:20000/ngwbcontrol/BGBUSI/getCustomerCharacter',
   headers: { 
      'v': '0.67214105019480621730172981051', 
      'X-Requested-With': 'XMLHttpRequest', 
      'Cookie': 'appName=PDCENTERASIAINFO; mg_uem_user_id_c497fe63beeb41f3b95dac50d4357d5c=226e84a8-78a8-4c76-a0ea-34dcaab21c7d; cookieId=b2oRZ6Npu8_Zh_PYvKRvIurhkk9PLfG1726716232528; JSESSIONID=D82D2D7818364C64A8CCB0089B186558; TOKEN=C3FF296C9AC24ECA83206E921FF317B2', 
      'User-Agent': 'Apifox/1.0.0 (https://apifox.com)', 
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
   },
   data : data
};

axios(config)
.then(function (response) {
   console.log(JSON.stringify(response.data));
})
.catch(function (error) {
   console.log(error);
});