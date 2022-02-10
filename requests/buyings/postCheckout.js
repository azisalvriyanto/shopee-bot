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
      'if-none-match-: 55b03-560c1be0a0e733dac9566cdc6d227463',
      'content-type: application/json',
      `x-csrftoken: ${data.shopeeInfo.cookies.csrftoken}`,
      'origin: https://shopee.co.id',
      'sec-fetch-site: same-origin',
      'sec-fetch-mode: cors',
      'sec-fetch-dest: empty',
      `referer: https://shopee.co.id/cart?itemKeys=${data.buyingInfo.cart.cart_item.itemid}.${data.buyingInfo.cart.cart_item.modelid}.&shopId=${data.buyingInfo.cart.cart_item.shopid}`,
      'accept-language: en-US,en;q=0.9',
      `cookie: ${curl.serializeCookie(data.shopeeInfo.cookies)}`,
    ]).setBody(JSON.stringify({
      "selected_shop_order_ids": [{
        "shopid": data.buyingInfo.cart.cart_item.shopid,
        "item_briefs": [{
          "itemid": data.buyingInfo.cart.cart_item.itemid,
          "modelid": data.buyingInfo.cart.cart_item.modelid,
          "item_group_id": data.buyingInfo.cart.cart_item.item_group_id,
          // "applied_promotion_id": user.config.promotionid,
          "offerid": data.buyingInfo.selectedItem.offerid,
          "price": data.buyingInfo.cart.cart_item.price,
          "quantity": data.buyingInfo.cart.cart_item.quantity,
          "is_add_on_sub_item": data.buyingInfo.selectedItem.is_add_on_sub_item,
          "add_on_deal_id": data.buyingInfo.selectedItem.add_on_deal_id,
          "status": data.buyingInfo.selectedItem.status,
          "cart_item_change_time": data.buyingInfo.selectedItem.cart_item_change_time
        }],
        "shop_vouchers": []
      }],
      "platform_vouchers": [],
      "free_shipping_voucher_info": {
        "free_shipping_voucher_id": 0,
        "free_shipping_voucher_code": null
      },
      "use_coins": false
    })).post(`https://shopee.co.id/api/v4/cart/checkout`)
}