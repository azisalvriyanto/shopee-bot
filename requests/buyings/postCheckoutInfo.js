module.exports = async function (data) {
  let curl = new data.Curl()

  return curl.setOpt(curl.libcurl.option.SSL_VERIFYPEER, false).setOpt(curl.libcurl.option.TCP_KEEPALIVE, true).setOpt(curl.libcurl.option.TIMEOUT, 2)
    .setHeaders([
      'authority: shopee.co.id',
      'pragma: no-cache',
      'cache-control: no-cache',
      'x-cv-id: 9',
      `user-agent: ${process.env.USER_AGENT}`,
      'content-type: application/json',
      'accept: application/json',
      'x-shopee-language: id',
      'x-requested-with: XMLHttpRequest',
      'if-none-match-: 55b03-dec72446a290ee789f4625e516fbd51c',
      'x-api-source: pc',
      `x-csrftoken: ${data.shopeeInfo.cookies.csrftoken}`,
      'origin: https://shopee.co.id',
      'sec-fetch-site: same-origin',
      'sec-fetch-mode: cors',
      'sec-fetch-dest: empty',
      'referer: https://shopee.co.id/checkout',
      'accept-language: en-US,en;q=0.9',
      `cookie: ${curl.serializeCookie(data.shopeeInfo.cookies)}`
    ]).setBody(JSON.stringify({
      "shoporders": [{
        "shop": {
          "shopid": data.targetInfo.product.shopId
        },
        "items": [{
          "itemid": data.buyingInfo.cart.cart_item.itemid,
          "modelid": data.buyingInfo.cart.cart_item.modelid,
          // "add_on_deal_id": data.buyingInfo.selectedItem.add_on_deal_id,
          // "is_add_on_sub_item": data.buyingInfo.selectedItem.is_add_on_sub_item,
          "item_group_id": data.buyingInfo.cart.cart_item.item_group_id,
          "quantity": data.buyingInfo.cart.cart_item.quantity
        }],
        "shipping_id": 1
      }],
      "selected_payment_channel_data": {
        "channel_id": data.targetInfo.payment.method.spm_channel_id,
        "channel_item_option_info": {
          "option_info": data.targetInfo.payment.detail
        },
        "version": 2
      },
      "shipping_orders": [{
        "sync": true,
        "buyer_address_data": {
          "addressid": data.targetInfo.address.id
        },
        "selected_logistic_channelid": data.targetInfo.logisticId,
        "shipping_id": 1,
        "shoporder_indexes": [0],
        "selected_preferred_delivery_time_option_id": 0
      }]
    })).post(`https://shopee.co.id/api/v4/checkout/get`)
}