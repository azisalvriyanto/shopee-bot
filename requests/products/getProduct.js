module.exports = async function (data) {
    let curl = new data.Curl()

    return curl.setOpt(curl.libcurl.option.SSL_VERIFYPEER, false).setOpt(curl.libcurl.option.TCP_KEEPALIVE, true).setOpt(curl.libcurl.option.TIMEOUT, 2)
        .setHeaders([
            'authority: shopee.co.id',
            'pragma: no-cache',
            'cache-control: no-cache',
            'x-shopee-language: id',
            'x-requested-with: XMLHttpRequest',
            'if-none-match-: 55b03-39155c622be48dcc9e152107052ce172',
            `user-agent: ${process.env.USER_AGENT}`,
            'x-api-source: pc',
            'accept: */*',
            'sec-fetch-site: same-origin',
            'sec-fetch-mode: cors',
            'sec-fetch-dest: empty',
            `referer: ${data.targetInfo.product.url}`,
            'accept-language: en-US,en;q=0.9',
            `cookie: ${curl.serializeCookie(data.shopeeInfo.cookies)}`
        ]).get(`https://shopee.co.id/api/v2/item/get?itemid=${data.targetInfo.product.itemId}&shopid=${data.targetInfo.product.shopId}`)
}