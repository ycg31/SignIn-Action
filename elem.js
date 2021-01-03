/*
"饿了么" app(9.0.10) "我的 - 打卡领红包"自动签到，支持 Quantumult X（理论上也支持 Surge、Loon，未尝试）。
默认已使用 elemSign.js，故请先使用 elemGetCookies.js 获取 Token。(https://github.com/songyangzz/QuantumultX/blob/master/elem/elemGetCookies.js)
到 cron 设定时间自动签到时，若弹出"饿了么 - 打卡领红包 - 打卡成功"即完成签到，其他提示或无提示请发送日志信息至 issue。
⚠️免责声明：
1. 此脚本仅用于学习研究，不保证其合法性、准确性、有效性，请根据情况自行判断，本人对此不承担任何保证责任。
2. 由于此脚本仅用于学习研究，您必须在下载后 24 小时内将所有内容从您的计算机或手机或任何存储设备中完全删除，若违反规定引起任何事件本人对此均不负责。
3. 请勿将此脚本用于任何商业或非法目的，若违反规定请自行对此负责。
4. 此脚本涉及应用与本人无关，本人对因此引起的任何隐私泄漏或其他后果不承担任何责任。
5. 本人对任何脚本引发的问题概不负责，包括但不限于由脚本错误引起的任何损失和损害。
6. 如果任何单位或个人认为此脚本可能涉嫌侵犯其权利，应及时通知并提供身份证明，所有权证明，我们将在收到认证文件确认后删除此脚本。
7. 所有直接或间接使用、查看此脚本的人均应该仔细阅读此声明。本人保留随时更改或补充此声明的权利。一旦您使用或复制了此脚本，即视为您已接受此免责声明。
Author：zZPiglet
Modby: ycg31
Quantumult X (App Store:1.0.5+, TestFlight 190+):
[task_local]
1 0 * * * elemCheckIn.js, tag=饿了么-打卡领红包
or remote
1 0 * * * https://raw.githubusercontent.com/zZPiglet/Task/master/elem/elemCheckIn.js, tag=饿了么-打卡领红包
Surge 4.0+ & Loon:
[Script]
cron "1 0 * * *" script-path=https://raw.githubusercontent.com/zZPiglet/Task/master/elem/elemCheckIn.js
*/
const $ = new Env('饿了么')
const notify = $.isNode() ? require('./sendNotify') : '';

const CheckInURL = 'https://h5.ele.me/restapi/acquisition/dailyCheckIn/v1/checkIn'

const $cmp = compatibility()

// 判断github action里面是否有饿了么cookies
if (process.env.cookie_elem) {
  $.cookie_elem = process.env.cookie_elem
  // 开始签到
  Checkin()
}else{
	notify.sendNotify('饿了么 - 打卡领红包', '未设置cookie', '请检查secret里是否设置cookie_elem');
}


function Checkin() {
    let subTitle = ''
    let detail = ''
    const daily = {
        url: CheckInURL,
        headers: {
            "Cookie": $.cookie_elem
        }
    }
    $cmp.post(daily, function(error, response, data) {
        if (!error) {
                const result = JSON.parse(data)
                if (result.code == 200) {
                    subTitle += '打卡成功！🍗'
                    let todayearn = result.data.checkInAmount / 100
                    let total = result.data.currentAmount / 100
                    detail += '打卡获得 ' + todayearn + ' 元，账户共有 ' + total + ' 元红包。'
                } else if (result.code == 4003) {
                    subTitle += '重复打卡！🥡'
                    detail += result.message
                } else {
                    subTitle += '打卡失败‼️ 详情请见日志。'
                    detail += data
                    $cmp.log("elem failed response : \n" + data)
                }
        } else {
            subTitle += '打卡接口请求失败，详情请见日志。'
            detail += error
            $cmp.log("elem failed response : \n" + error)
        }
        notify.sendNotify('饿了么 - 打卡领红包', subTitle, detail)
    })
}

function compatibility() {
    const node = (() => {
            const request = require('request')
            return ({request})
    })()
    const notify = (title, subtitle, message) => {
        log(title+subtitle+message)
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
    return { notify,  get, post, log }
}