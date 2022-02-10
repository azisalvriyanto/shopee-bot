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
      'if-none-match-: 55b03-110b0bbaf36f20781fd87d3c35df9d30',
      'content-type: application/json',
      `x-csrftoken: ${data.shopeeInfo.cookies.csrftoken}`,
      'origin: https://shopee.co.id',
      'sec-fetch-site: same-origin',
      'sec-fetch-mode: cors',
      'sec-fetch-dest: empty',
      'referer: https://shopee.co.id/verify/link',
      'accept-language: id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      `cookie: ${curl.serializeCookie(data.shopeeInfo.cookies)}`
    ]).setBody(JSON.stringify({
      msg_type: 2,
      v_token: data.shopeeInfo.login.method.data[0].v_token,
      request_id: data.shopeeInfo.login.auth.data.ivs_token
    })).post(`https://shopee.co.id/api/v4/anti_fraud/ivs/link/verify`)
}