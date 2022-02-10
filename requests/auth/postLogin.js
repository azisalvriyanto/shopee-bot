module.exports = async function (data) {
  let curl = new data.Curl()

  return curl.setOpt(curl.libcurl.option.SSL_VERIFYPEER, false).setOpt(curl.libcurl.option.TCP_KEEPALIVE, true).setOpt(curl.libcurl.option.TIMEOUT, 2)
    .setHeaders([
      'authority: shopee.co.id',
      `user-agent: ${process.env.USER_AGENT}`,
      'x-api-source: web',
      'accept: application/json',
      'x-shopee-language: id',
      'x-requested-with: XMLHttpRequest',
      'if-none-match-: 55b03-388713a4681cb46b1983b1b738173d6c',
      'content-type: application/json',
      `x-csrftoken: ${data.shopeeInfo.cookies.csrftoken}`,
      'origin: https://shopee.co.id',
      'sec-fetch-site: same-origin',
      'sec-fetch-mode: cors',
      'sec-fetch-dest: empty',
      'referer: https://shopee.co.id/buyer/login',
      'accept-language: en-US,en;q=0.9',
      `cookie: ${curl.serializeCookie(data.shopeeInfo.cookies)}`
    ]).setBody(JSON.stringify({
      phone: data.shopeeInfo.profile.phone,
      password: data.shopeeInfo.profile.password,
      support_whats_app: true,
      support_ivs: true,
    })).post(`https://shopee.co.id/api/v2/authentication/login`)
}