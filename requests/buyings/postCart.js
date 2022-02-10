module.exports = async function (data) {
    let curl = new data.Curl()

    return curl.setOpt(curl.libcurl.option.SSL_VERIFYPEER, false).setOpt(curl.libcurl.option.TCP_KEEPALIVE, true).setOpt(curl.libcurl.option.TIMEOUT, 2)
        .setHeaders([
            'authority: shopee.co.id',
            'referrer-policy: strict-origin-when-cross-origin',
            'mode: cors',
            'pragma: no-cache',
            'cache-control: no-cache',
            `user-agent: ${process.env.USER_AGENT}`,
            'x-api-source: pc',
            'accept: application/json',
            'x-shopee-language: id',
            'x-requested-with: XMLHttpRequest',
            'if-none-match-: 55b03-59dd4675a7a3ca83bd645ec57bb57ebe',
            'content-type: application/json',
            `x-csrftoken: ${data.shopeeInfo.cookies.csrftoken}`,
            'origin: https://shopee.co.id',
            'sec-fetch-site: same-origin',
            'sec-fetch-mode: cors',
            'sec-fetch-dest: empty',
            `referer: ${data.targetInfo.product.url}`,
            'accept-language: en-US,en;q=0.9',
            `cookie: ${curl.serializeCookie(data.shopeeInfo.cookies)}`
        ]).setBody(JSON.stringify({
            "quantity": 1,
            "checkout": true,
            "update_checkout_only": false,
            "donot_add_quantity": true,
            "source": "{\"refer_urls\":[]}",
            "client_source": 1,
            "shopid": data.targetInfo.product.shopId,
            "itemid": data.targetInfo.product.itemId,
            "modelid": data.targetInfo.product.modelId,
            ... function (item) {
                if (item.add_on_deal_info != null) {
                    return {
                        "add_on_deal_id": item.add_on_deal_id
                    }
                }
            }(data.targetInfo.product.detail.item)
        })).post(`https://shopee.co.id/api/v4/cart/add_to_cart`)
}