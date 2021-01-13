/*
原作者 songyangzz
原脚本：https://github.com/songyangzz/QuantumultX/blob/master/elem/elemSign.js
由yandogn31修改
本脚本：https://github.com/ycg31/SignIn-Action/blob/main/elemsign.js
*/

const notify = require('./sendNotify');
const delay=3000;
const cookieName = '饿了么'
const cookieKey = 'cookie_elem'
const UserId = 'user_id_elem'
const sy = init()

// 判断github action里面是否有饿了么cookies
if (process.env.cookie_elem) {
  var cookieVal = process.env.cookie_elem;
  }else{
  notify.sendNotify('饿了么', '未设置cookie', '请检查secret里是否设置cookie_elem');
}

var regx = /USERID=\d+/;

var userid = cookieVal.match(regx)[0];
userid = userid.replace('USERID=', '');


var headerscommon = {
  'Content-Type': 'application/json',
  'Cookie': cookieVal,
  'f-refer': 'wv_h5',
  'Origin': 'https://tb.ele.me',
  'Referer': 'https://tb.ele.me/wow/zele/act/qiandao?wh_biz=tm&source=main',
  'User-Agent': 'Rajax/1 Apple/iPhone11,8 iOS/13.3 Eleme/8.29.6 ID/BFA5A018-7070-4341-9DEF-763E3B23EA282; IsJailbroken/1 Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 AliApp(ELMC/8.29.6) UT4Aplus/0.0.4 WindVane/8.6.0 828x1792 WK'
}

//签到结果
var signresult = '';
var title = '饿了么签到';
var signdate = signresult + 1

//翻牌结果
var turnstr = '翻牌结果: ';

//翻牌奖励
var turnresult = new Array;

//签到奖励
var sign_result = new Array;

var hisresult;
sign()

function sign() {

  dosignhis().then((data) => {
    if (hisresult) {
     if (hisresult.has_signed_in_today) {
        signresult = `签到结果: 重复❗ 已连续签到${hisresult.current_day+1}天`;
        title = `饿了么签到重复❗`;
        signdate = hisresult.current_day + 1
        sy.log("签到结果: 重复❗ 已连续签到"+signdate+"天");
        turnstr=turnstr+'无';
        doNotify();
      }
      else {
        dosign().then((data) => {
            doturnover(1,200).then((data) => {
              doshare().then((data) => {

                doturnover(2,delay).then((data) => {
      
                  doNotify();
                })
              })
          })
        })
      }
    }
  });
}

function dosign() {

  return new Promise(resolve => {
    setTimeout(() => {

      try {
        var endurl = '/sign_in'
        url = { url: `https://h5.ele.me/restapi/member/v2/users/`, headers: headerscommon }
        if (cookieVal == undefined || cookieVal == "0" || cookieVal == null) {
          sy.msg(cookieName, "未获取Cookie", '');
          return;
        }

        url.url += userid;
        url.url += endurl;

        sy.post(url, (error, response, data) => {
          var obj = JSON.parse(data);
          if (response.status == 200) {
            signresult = `已连续签到${hisresult.current_day+1}天`
            title = `饿了么签到成功🎉`;
            sign_result = obj;
            sy.log("签到结果: 成功🎉 已连续签到"+signdate+"天");
          } else if (response.status == 400) {
            signresult = `已连续签到${hisresult.current_day}天`
            title = `饿了么签到结果重复❗ `;
            sy.log("签到结果: 重复❗ 已连续签到"+hisresult.current_day+"天");
          }
          else {
            signresult = `已连续签到${hisresult.current_day}天`
            title = `饿了么签到结果失败❌`;
            sy.log("签到结果: 失败❌已连续签到"+hisresult.current_day+"天");
          }
          resolve('done');
        })
      }
      catch (erre) {
        resolve('done')
      }
    })
  })
}

function doturnover(count,time) {

  return new Promise(resolve => {
    setTimeout(() => {

      try {
        var endurl = '/sign_in/daily/prize'
        let body = { "channel": "app", "index": random(0, 3), "longitude": 116.334716796875, "latitude": 59.73897171020508 };
        url = {
          url: `https://h5.ele.me/restapi/member/v2/users/`,
          headers: headerscommon,
          body: JSON.stringify(body)
        }
        if (cookieVal == undefined || cookieVal == "0" || cookieVal == null) {
          sy.msg(cookieName, "未获取Cookie", '');
          return;
        }
        url.url += userid;
        url.url += endurl;
        sy.post(url, (error, response, data) => {
          var obj = JSON.parse(data);
          sy.log("尝试第"+count+"次翻牌");
          if (response.status == 200) {
            turnstr = turnstr + `成功(${count})🎉 `
            sy.log("翻牌成功");
            for (var i in obj) {
              turnresult.push(obj[i]);
            }

          } else if (response.status == 400) {
            turnstr = turnstr + `重复(${count})❗ `
            sy.log("已翻过牌");
          }
          else {
            turnstr = turnstr + `未知(${count})❗ `
            sy.log("翻牌失败，等重试");
          }


          resolve('done');
        })
      }
      catch (erre) {
        resolve('done')
      }
    },time)
  })
}

function doshare() {

  return new Promise(resolve => {
    setTimeout(() => {

      try {
        var endurl = '/sign_in/wechat'
        let body = { "channel": "app" };
        url = {
          url: `https://h5.ele.me/restapi/member/v1/users/`,
          headers: headerscommon,
          body: JSON.stringify(body)
        }
        if (cookieVal == undefined || cookieVal == "0" || cookieVal == null) {
          sy.msg(cookieName, "未获取Cookie", '');
          return;
        }
        url.url += userid;
        url.url += endurl;
        sy.post(url, (error, response, data) => {
          if (response.status == 200) {

            sy.log("分享微信成功");
          }
          else {
            sy.log("分享微信失败");
          }


          resolve('done');
        })
      }
      catch (erre) {
        resolve('done')
      }
    })
  })
}

function dosignhis() {

  return new Promise(resolve => {
    setTimeout(() => {

      try {
        var endurl = '/sign_in/info'
        url = { url: `https://h5.ele.me/restapi/member/v1/users/`, headers: headerscommon }
        if (cookieVal == undefined || cookieVal == "0" || cookieVal == null) {
          sy.msg(cookieName, "未获取Cookie", '');
          return;
        }
        url.url += userid;
        url.url += endurl;
        sy.get(url, (error, response, data) => {

          var obj = JSON.parse(data);

          hisresult = obj;


          resolve('done');
        })
      }
      catch (erre) {
        resolve('done')
      }
    })
  })
}

function doNotify() {
  var ret = signresult+'\n';
  for (var i = 0; i < sign_result.length; i++) {
    ret = ret + '***获得：' + sign_result[i].name + '(' + sign_result[i].amount + ')元🧧\n';
  }
  ret = ret + turnstr + '\n';
  for (var i = 0; i < turnresult.length; i++) {
    if (turnresult[i].status == 1) {
      ret = ret + '***获得：' + turnresult[i].prizes[0].name + '(' + turnresult[i].prizes[0].amount + ')元🧧\n';
    }
  }
  
  ret = ret + '签到3天得3元🧧，7天抽10-200元🧧';
  
  sy.msg(title, ret, '');
}



function init() {
    const node = (() => {
            const request = require('request')
            return ({request})
    })()
    const msg = (title, subtitle, message) => {
      notify.sendNotify(title, subtitle, message)
    }
    const adapterStatus = (response) => {
        if (response) {
            if (response.status) {
                response["statusCode"] = response.status
            } else if (response.statusCode) {
                response["status"] = response.statusCode
            }
        }
        return response
    }
    const get = (options, callback) => {
            node.request(options, (error, response, body) => {
                callback(error, adapterStatus(response), body)
            })
    }
    const post = (options, callback) => {
            node.request.post(options, (error, response, body) => {
                callback(error, adapterStatus(response), body)
            })
    }
    const log = (message) => console.log(message)
    return { msg,  get, post, log }
}



function random(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
