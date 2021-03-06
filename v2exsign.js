/*
mod by ycg31
修改自 https://github.com/Wenmoux/V2ex-Auto-Sign
本脚本链接 https://raw.githubusercontent.com/ycg31/SignIn-Action/main/v2exsign.js

获取cookie方法
1.打开v2ex网站登录成功，Google浏览器按F12进入调试模式。
2.点击Network->左边条目选择www.v2ex.com->点击Headers
3.下拉在Request Header栏内找到cookies： 复制全部内容
4.在github仓库的settings-secrets里面新建一个，name为V2EXCK，Vaule为上面获取的cookie.
*/

const notify = require('./sendNotify');
const fs = require("fs");
const axios = require("axios");
const moment = require('moment');

// 判断github action里面是否有饿了么cookies
if (!process.env.V2EXCK) {
  notify.sendNotify('V2EX', '未设置cookie', '请检查secret里是否设置V2EXCK');  
  process.exitCode = 1; 
}
const cookie = process.env.V2EXCK;

once = null;
ckstatus = 1; 
signstatus = 0;
//time = new Date();
time = moment().utcOffset(8).format('YYYY-MM-DD HH:mm:ss'); 

//tmpHours = time.getHours();time.setHours(tmpHours + 8);
//notice = time.toLocaleString() + "\n";
notice = time + "\n";
title = "V2EX签到："
const header = {
    headers: {
        Referer: "https://www.v2ex.com/mission",
        Host: "www.v2ex.com",
        "user-agent": "Mozilla/5.0 (Linux; Android 10; Redmi K30) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.83 Mobile Safari/537.36",
        cookie: `'${cookie}'`,
    },
};

//获取once检查是否已签到
function check() {
    return new Promise(async (resolve) => {
        try {
            let url = "https://www.v2ex.com/mission/daily";
            let res = await axios.get(url, header);
            reg1 = /需要先登录/;
            if (reg1.test(res.data)) {
                console.log("cookie失效");
                ckstatus = 0;
                notice += "cookie失效";
                title += "cookie失效";
            } else {
                reg = /每日登录奖励已领取/;
                if (reg.test(res.data)) {
                    notice += "今天已经签到过啦\n";
                    title += "重复";
                    signstatus =1 ;
                } else {
                    reg = /redeem\?once=(.*?)'/;
                    once = res.data.match(reg)[1];
                    console.log(`获取成功 once:${once}`);
                }
            }
        } catch (err) {
            console.log(err);
        }
        resolve();
    });
}

//每日签到
function daily() {
    return new Promise(async (resolve) => {
        try {
            let url = `https://www.v2ex.com/mission/daily/redeem?once=${once}`;
            let res = await axios.get(url, header);
            reg = /已成功领取每日登录奖励/;
            if (reg.test(res.data)) {
                notice += "签到成功\n";
                title += "成功";
                signstatus =1 ;
            } else {
                notice += "签到失败\n";
                title += "失败";
            }
        } catch (err) {
            console.log(err);
        }
        resolve();
    });
}

//查询余额
function balance() {
    return new Promise(async (resolve) => {
        try {
            let url = "https://www.v2ex.com/balance";
            let res = await axios.get(url, header);
            reg = /\d+?\s的每日登录奖励\s\d+\s铜币/;
            console.log(res.data.match(reg)[0]);
            notice += res.data.match(reg)[0];
        } catch (err) {
            console.log(err);
        }
        resolve();
    });
}

function sign() {
    return new Promise(async (resolve) => {
        try {
          if (!cookie) {
              console.log("你的cookie呢！！！");
//              notify.sendNotify("V2EX", "你的cookie呢！！！", "");
              return;
          }

          await check();

          if (ckstatus == 1 ) {
              if (once&& signstatus==0) {
                  await daily();
                  if (signstatus==0) {                           
                   //如果签到失败
                    await check();
                    await daily();             
                  }
              }

              await balance();            
          } else {}
        
          console.log(notice);
          fs.writeFile("./signresult.txt",notice +  `\n`, {flag: "a", },
              (err) => {
                  if (err) {
                      throw err;
                  } else {
                      console.log("success");
                  }
              }
          );
          await notify.sendNotify(title, notice, "");
        } catch (err) {
            console.log(err);
        }
        resolve();
    });
}

sign();