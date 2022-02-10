module.exports = async function (data) {
  let curl = new data.Curl()

  return curl.setOpt(curl.libcurl.option.SSL_VERIFYPEER, false).setOpt(curl.libcurl.option.TCP_KEEPALIVE, true).setOpt(curl.libcurl.option.TIMEOUT, 2)
    .setHeaders([
      'authority: shopee.co.id',
      'pragma: no-cache',
      'cache-control: no-cache',
      `user-agent: ${process.env.USER_AGENT}`,
      'x-api-source: pc',
      'accept: application/json',
      'x-shopee-language: id',
      'x-requested-with: XMLHttpRequest',
      'if-none-match-: 55b03-9b70b03c5ba99324b3a00472738d35d2',
      'content-type: application/json',
      `x-csrftoken: ${data.shopeeInfo.cookies.csrftoken}`,
      'origin: https://shopee.co.id',
      'sec-fetch-site: same-origin',
      'sec-fetch-mode: cors',
      'sec-fetch-dest: empty',
      'referer: https://shopee.co.id/authenticate/ivs',
      'accept-language: id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      `cookie: ${curl.serializeCookie(data.shopeeInfo.cookies)}`
    ]).setBody(JSON.stringify({
      is_user_login: true,
      is_web: true,
      ivs_flow_no: data.shopeeInfo.login.auth.data.ivs_flow_no,
      ivs_signature: data.shopeeInfo.login.tokenVerify.signature,
      ivs_method: 5
    })).post(`https://shopee.co.id/api/v4/account/basic/login_ivs`)
}