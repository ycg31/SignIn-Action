const $ = new init()
const notify = require('./sendNotify');

// 判断github action里面是否有值得买cookies
if (process.env.XMLY_COOKIES) {
  var VAL_signcookie = process.env.XMLY_COOKIES
  $.log(`coocike为：${VAL_signcookie}`)
  }else{
  notify.sendNotify('喜马拉雅', '未设置cookie', '请检查secret里是否设置XMLY_COOKIES');
}


$.signinfo = {}
const data = new Date();
tmpHours = data.getHours();data.setHours(tmpHours + 8);
let time = data.getTime();

;(exec = async () => {
  await getinfo()
  if ($.signinfo.info.isTickedToday == 0) await signapp()
  // await browseapp()
  await getacc()
  showmsg()
})()
  .catch((e) => $.logErr(e))

function signapp() {
  return new Promise((resolve, reject) => {
    const url = {
      url: `https://hybrid.ximalaya.com/web-activity/signIn/action?aid=8&ts=${time}&_sonic=0&impl=com.gemd.iting&_sonic=0`,
      headers: { Cookie: VAL_signcookie }
    }
    url.headers['Accept'] = 'application/json, text/plain, */*'
    url.headers['Accept-Encoding'] = 'gzip, deflate, br'
    url.headers['Accept-Language'] = 'zh-cn'
    url.headers['Connection'] = 'keep-alive'
    url.headers['Host'] = 'hybrid.ximalaya.com'
    url.headers['User-Agent'] =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 iting/6.6.45 kdtunion_iting/1.0 iting(main)/6.6.45/ios_1'
    $.post(url, (error, response, data) => {
      try {
        $.signinfo.sign = JSON.parse(response.body)
        $.log(` 签到结果: ${$.signinfo.sign.data.status}`)
        resolve()
      } catch (e) {
        notify.sendNotify('喜马拉雅', `签到结果: 失败`, `说明: ${e}`)
        $.log(`❌  signapp - 签到失败: ${e}`)
        $.log(`❌  signapp - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function browseapp() {
  return new Promise((resolve, reject) => {
    let data1 = new Date();
    let tmpHours1 = data1.getHours();data1.setHours(tmpHours1 + 8);
    let time1 = data1.getTime();
    const timestamp = Math.round(time1 / 1000).toString()
    const browseappurl = `https://mobile.ximalaya.com/daily-label-mobile/v1/task/checkIn/ts-${timestamp}?coinSwitch=true`
    const url = { url: browseappurl, headers: { Cookie: VAL_signcookie } }
    url.headers['Accept'] = '*/*'
    url.headers['Accept-Encoding'] = 'gzip, deflate'
    url.headers['Accept-Language'] = 'zh-Hans-CN;q=1, en-US;q=0.9'
    url.headers['Connection'] = 'close'
    url.headers['Host'] = 'mobile.ximalaya.com'
    url.headers['User-Agent'] =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 iting/6.6.45 kdtunion_iting/1.0 iting(main)/6.6.45/ios_1'
    $.get(url, (error, response, data) => {
      try {
        $.log(`❕  browseapp - response: ${JSON.stringify(response)}`)
        $.signinfo.browseapp = JSON.parse(data)
        resolve()
      } catch (e) {
        notify.sendNotify('喜马拉雅', `每日浏览: 失败`, `说明: ${e}`)
        $.log(`❌  browseapp - 每日浏览: ${e}`)
        $.log(`❌  browseapp - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function getinfo() {
  return new Promise((resolve, reject) => {
    const url = { url: `https://m.ximalaya.com/starwar/lottery/check-in/record`, headers: { Cookie: VAL_signcookie } }
    url.headers['Accept'] = `application/json, text/plain, */*`
    url.headers['Accept-Encoding'] = `gzip, deflate, br`
    url.headers['Accept-Language'] = `zh-cn`
    url.headers['Connection'] = `keep-alive`
    url.headers['Content-Type'] = `application/json;charset=utf-8`
    url.headers['Host'] = `m.ximalaya.com`
    url.headers['User-Agent'] =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 iting/6.6.45 kdtunion_iting/1.0 iting(main)/6.6.45/ios_1'
    $.get(url, (error, response, data) => {
      try {
        $.signinfo.info = JSON.parse(data)
        $.log(` 签到信息: ${$.signinfo.info.isTickedToday}`)
        resolve()
      } catch (e) {
        notify.sendNotify('喜马拉雅', `获取签到信息: 失败`, `说明: ${e}`)
        $.log(`❌  getinfo - 获取签到信息失败: ${e}`)
        $.log(`❌  getinfo - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function getacc() {
  return new Promise((resolve, reject) => {
    const url = { url: `https://m.ximalaya.com/starwar/task/listen/account`, headers: { Cookie: VAL_signcookie } }
    url.headers['Accept'] = `application/json, text/plain, */*`
    url.headers['Accept-Encoding'] = `gzip, deflate, br`
    url.headers['Accept-Language'] = `zh-cn`
    url.headers['Connection'] = `keep-alive`
    url.headers['Content-Type'] = `application/json;charset=utf-8`
    url.headers['Host'] = `m.ximalaya.com`
    url.headers['User-Agent'] =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 iting/6.6.45 kdtunion_iting/1.0 iting(main)/6.6.45/ios_1'
    $.get(url, (error, response, data) => {
      try {
        $.signinfo.acc = JSON.parse(data)
        resolve()
      } catch (e) {
        notify.sendNotify('喜马拉雅', `获取账号信息: 失败`, `说明: ${e}`)
        $.log(`❌  getacc - 获取账号信息失败: ${e}`)
        $.log(`❌  getacc - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function showmsg() {
  let subTitle = ''
  let detail = ''
  if ($.signinfo.info.isTickedToday == false) {
    if ($.signinfo.sign.data.status == 0) {
      subTitle = '签到: 成功'
      detail = `当前连签: ${$.signinfo.info.continuousDays + 1}天, 积分: ${$.signinfo.acc.data.score}(+${$.signinfo.info.awardAmount})`
    } else if ($.signinfo.sign.data.msg != undefined) {
      subTitle = '签到: 失败'
      detail = `说明: ${$.signinfo.sign.data.msg}`
    } else {
      subTitle = '签到: 失败'
      detail = `说明: Cookie失效`
    }
  } else {
    subTitle = `签到: 重复`
    detail = `当前连签: ${$.signinfo.info.continuousDays}天, 积分: ${$.signinfo.acc.data.score}(+${$.signinfo.info.awardAmount})`
  }

  if ($.signinfo.browseapp) {
    if ($.signinfo.browseapp.ret == 0 && $.signinfo.browseapp.data && $.signinfo.browseapp.data.awards) {
      if ($.signinfo.browseapp.data.awards) subTitle += `, 每日浏览: 成功 (${$.signinfo.browseapp.data.awards})`
      else subTitle += ', 每日浏览: 重复'
    } else {
      subTitle += ', 每日浏览: 失败'
    }
  }
  notify.sendNotify('喜马拉雅', subTitle, detail)
}

function init() {

    const name = (title) => {
      return title
    }

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

// prettier-ignore