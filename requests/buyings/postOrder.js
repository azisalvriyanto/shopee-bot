const { addDots } = require('../../helpers')
const Data = require('../../models/Data');

module.exports = async function (data) {
  let curl = new data.Curl()

  let shippingOrder = data.buyingInfo.checkoutInfo.shipping_orders[0]
  let checkoutPriceData = data.buyingInfo.checkoutInfo.checkout_price_data
  let shopOrder = data.buyingInfo.checkoutInfo.shoporders[0]
  let promotionData = data.buyingInfo.checkoutInfo.promotion_data
  let logistic = shopOrder.logistics.logistic_channels[shippingOrder.selected_logistic_channelid]

  let body = {
    "status": 200,
    "headers": {},
    "cart_type": data.buyingInfo.checkoutInfo.cart_type,
    "shipping_orders": [
      {
        "selected_logistic_channelid": shippingOrder.selected_logistic_channelid,
        "cod_fee": shippingOrder.cod_fee,
        "order_total": shippingOrder.shipping_fee + (data.buyingInfo.cart.cart_item.price * data.buyingInfo.cart.cart_item.quantity),
        "shipping_id": shippingOrder.shipping_id,
        "shopee_shipping_discount_id": shippingOrder.shopee_shipping_discount_id,
        "selected_logistic_channelid_with_warning": shippingOrder.selected_logistic_channelid_with_warning,
        "shipping_fee_discount": shippingOrder.shipping_fee_discount,
        "shipping_group_description": shippingOrder.shipping_group_description,
        "selected_preferred_delivery_time_option_id": 0,
        "buyer_remark": shippingOrder.buyer_remark || "",
        "buyer_address_data": shippingOrder.buyer_address_data,
        "order_total_without_shipping": data.buyingInfo.cart.cart_item.price * data.buyingInfo.cart.cart_item.quantity,
        "tax_payable": shippingOrder.tax_payable,
        "amount_detail": {
          "BASIC_SHIPPING_FEE": shippingOrder.amount_detail.BASIC_SHIPPING_FEE,
          "SELLER_ESTIMATED_INSURANCE_FEE": shippingOrder.amount_detail.SELLER_ESTIMATED_INSURANCE_FEE,
          "SHOPEE_OR_SELLER_SHIPPING_DISCOUNT": shippingOrder.amount_detail.SHOPEE_OR_SELLER_SHIPPING_DISCOUNT,
          "VOUCHER_DISCOUNT": shippingOrder.amount_detail.VOUCHER_DISCOUNT,
          "SHIPPING_DISCOUNT_BY_SELLER": shippingOrder.amount_detail.SHIPPING_DISCOUNT_BY_SELLER,
          "SELLER_ESTIMATED_BASIC_SHIPPING_FEE": shippingOrder.amount_detail.SELLER_ESTIMATED_BASIC_SHIPPING_FEE,
          "SHIPPING_DISCOUNT_BY_SHOPEE": shippingOrder.amount_detail.SHIPPING_DISCOUNT_BY_SHOPEE,
          "INSURANCE_FEE": shippingOrder.amount_detail.INSURANCE_FEE,
          "ITEM_TOTAL": data.buyingInfo.cart.cart_item.price * data.buyingInfo.cart.cart_item.quantity,
          "TAX_EXEMPTION": shippingOrder.amount_detail.TAX_EXEMPTION,
          "shop_promo_only": shippingOrder.amount_detail.shop_promo_only,
          "COD_FEE": shippingOrder.amount_detail.COD_FEE,
          "TAX_FEE": shippingOrder.amount_detail.TAX_FEE,
          "SELLER_ONLY_SHIPPING_DISCOUNT": shippingOrder.amount_detail.SELLER_ONLY_SHIPPING_DISCOUNT
        },
        "buyer_ic_number": shippingOrder.buyer_ic_number || "",
        "fulfillment_info": shippingOrder.fulfillment_info,
        "voucher_wallet_checking_channel_ids": shippingOrder.voucher_wallet_checking_channel_ids,
        "shoporder_indexes": shippingOrder.shoporder_indexes,
        "shipping_fee": shippingOrder.shipping_fee,
        "tax_exemption": shippingOrder.tax_exemption,
        "shipping_group_icon": shippingOrder.shipping_group_icon
      }
    ],
    "disabled_checkout_info": data.buyingInfo.checkoutInfo.disabled_checkout_info,
    "timestamp": data.buyingInfo.checkoutInfo.timestamp,
    "checkout_price_data": {
      "shipping_subtotal": checkoutPriceData.shipping_subtotal,
      "shipping_discount_subtotal": checkoutPriceData.shipping_discount_subtotal,
      "shipping_subtotal_before_discount": checkoutPriceData.shipping_subtotal_before_discount,
      "bundle_deals_discount": checkoutPriceData.bundle_deals_discount,
      "group_buy_discount": checkoutPriceData.group_buy_discount,
      "merchandise_subtotal": data.buyingInfo.cart.cart_item.price * data.buyingInfo.cart.cart_item.quantity,
      "tax_payable": checkoutPriceData.tax_payable,
      "buyer_txn_fee": checkoutPriceData.buyer_txn_fee,
      "credit_card_promotion": checkoutPriceData.credit_card_promotion,
      "promocode_applied": checkoutPriceData.promocode_applied,
      "shopee_coins_redeemed": checkoutPriceData.shopee_coins_redeemed,
      "total_payable": shippingOrder.shipping_fee + (data.buyingInfo.cart.cart_item.price * data.buyingInfo.cart.cart_item.quantity) + checkoutPriceData.buyer_txn_fee,
      "tax_exemption": checkoutPriceData.tax_exemption
    },
    "client_id": data.buyingInfo.checkoutInfo.client_id,
    "promotion_data": {
      "promotion_msg": promotionData.promotion_msg,
      "price_discount": promotionData.price_discount,
      "can_use_coins": promotionData.can_use_coins,
      "voucher_info": promotionData.voucher_info,
      "coin_info": promotionData.coin_info,
      "free_shipping_voucher_info": {
        "free_shipping_voucher_id": promotionData.free_shipping_voucher_info.free_shipping_voucher_id || 0,
        "disabled_reason": promotionData.free_shipping_voucher_info.disabled_reason,
        "free_shipping_voucher_code": promotionData.free_shipping_voucher_info.free_shipping_voucher_code || ""
      },
      "applied_voucher_code": promotionData.applied_voucher_code,
      // ...function (vouchers) {
      //   if (vouchers.length > 0) {
      //     for (const voucher of vouchers) {
      //       if (voucher.promotionid == user.config.promotionid) {
      //         return {
      //           shop_voucher_entrances: [{
      //             "status": true,
      //             "shopid": user.config.shopid
      //           }]
      //         }
      //       }
      //     }
      //   }
      //   return {
      //     shop_voucher_entrances: [{
      //       "status": false,
      //       "shopid": user.config.shopid
      //     }]
      //   }
      // }(user.updateKeranjang.data.shop_vouchers),
      "card_promotion_enabled": promotionData.card_promotion_enabled,
      "invalid_message": promotionData.invalid_message,
      "card_promotion_id": promotionData.card_promotion_id,
      "voucher_code": promotionData.voucher_code,
      "use_coins": promotionData.use_coins
    },
    "dropshipping_info": data.buyingInfo.checkoutInfo.dropshipping_info,
    "selected_payment_channel_data": data.buyingInfo.checkoutInfo.selected_payment_channel_data,
    "shoporders": [
      {
        "shop": shopOrder.shop,
        "buyer_remark": shopOrder.buyer_remark || "",
        "shipping_fee": shopOrder.shipping_fee,
        "order_total": shopOrder.shipping_fee + (data.buyingInfo.cart.cart_item.price * data.buyingInfo.cart.cart_item.quantity),
        "shipping_id": shopOrder.shipping_id,
        "buyer_ic_number": shopOrder.buyer_ic_number || "",
        "items": shopOrder.items,
        "selected_preferred_delivery_time_option_id": shopOrder.selected_preferred_delivery_time_option_id,
        "selected_logistic_channelid": shopOrder.selected_logistic_channelid,
        "cod_fee": shopOrder.cod_fee,
        "tax_payable": shopOrder.tax_payable,
        "buyer_address_data": shopOrder.buyer_address_data,
        "shipping_fee_discount": shopOrder.shipping_fee_discount,
        "tax_info": shopOrder.tax_info,
        "order_total_without_shipping": data.buyingInfo.cart.cart_item.price * data.buyingInfo.cart.cart_item.quantity,
        "tax_exemption": shopOrder.tax_exemption,
        "amount_detail": {
          "BASIC_SHIPPING_FEE": shopOrder.amount_detail.BASIC_SHIPPING_FEE,
          "SELLER_ESTIMATED_INSURANCE_FEE": shopOrder.amount_detail.SELLER_ESTIMATED_INSURANCE_FEE,
          "SHOPEE_OR_SELLER_SHIPPING_DISCOUNT": shopOrder.amount_detail.SHOPEE_OR_SELLER_SHIPPING_DISCOUNT,
          "VOUCHER_DISCOUNT": shopOrder.amount_detail.VOUCHER_DISCOUNT,
          "SHIPPING_DISCOUNT_BY_SELLER": shopOrder.amount_detail.SHIPPING_DISCOUNT_BY_SELLER,
          "SELLER_ESTIMATED_BASIC_SHIPPING_FEE": shopOrder.amount_detail.SELLER_ESTIMATED_BASIC_SHIPPING_FEE,
          "SHIPPING_DISCOUNT_BY_SHOPEE": shopOrder.amount_detail.SHIPPING_DISCOUNT_BY_SHOPEE,
          "INSURANCE_FEE": shopOrder.amount_detail.INSURANCE_FEE,
          "ITEM_TOTAL": data.buyingInfo.cart.cart_item.price * data.buyingInfo.cart.cart_item.quantity,
          "TAX_EXEMPTION": shopOrder.amount_detail.TAX_EXEMPTION,
          "shop_promo_only": shopOrder.amount_detail.shop_promo_only,
          "COD_FEE": shopOrder.amount_detail.COD_FEE,
          "TAX_FEE": shopOrder.amount_detail.TAX_FEE,
          "SELLER_ONLY_SHIPPING_DISCOUNT": shopOrder.amount_detail.SELLER_ONLY_SHIPPING_DISCOUNT
        },
        "ext_ad_info_mappings": []
      }
    ],
    "can_checkout": true,
    "order_update_info": {},
    "buyer_txn_fee_info": data.buyingInfo.buyer_txn_fee_info,
    "captcha_version": 1
  }


  await Data.updateOne({
      chatId: data.chatId
  }, {
      buyingInfo: {
          ...data.buyingInfo,
          temporary: body
      }
  }).exec()

  return curl.setOpt(curl.libcurl.option.SSL_VERIFYPEER, false).setOpt(curl.libcurl.option.TCP_KEEPALIVE, true).setOpt(curl.libcurl.option.TIMEOUT, 2)
    // .setOtherOpt(function (curl) {
    //   user.config.end = Date.now();
    //   user.config.checkout = user.config.checkout || user.config.end
    // })
    .setHeaders([
      'authority: shopee.co.id',
      'pragma: no-cache',
      'cache-control: no-cache',
      'x-track-id: b26f0c4411c6ec81fdd4a770b81127bf82056f7c1275832a9a5aa6dc4f1b08e4aa7c97945459d6d56907f0d8e0aadf1eb5e584ef0b961ca54eb62487baf55e7b',
      'x-cv-id: 7',
      `user-agent: ${process.env.USER_AGENT}`,
      'content-type: application/json',
      'accept: application/json',
      'x-shopee-language: id',
      'x-requested-with: XMLHttpRequest',
      'if-none-match-: 55b03-8e6117c82a707ccb01b22fc18e91caff',
      'x-api-source: pc',
      `x-csrftoken: ${data.shopeeInfo.cookies.csrftoken}`,
      'origin: https://shopee.co.id',
      'sec-fetch-site: same-origin',
      'sec-fetch-mode: cors',
      'sec-fetch-dest: empty',
      'referer: https://shopee.co.id/checkout',
      'accept-language: en-US,en;q=0.9',
      `cookie: ${curl.serializeCookie(data.shopeeInfo.cookies)}`,
    ]).setBody(JSON.stringify({
      "status": 200,
      "headers": {},
      "cart_type": data.buyingInfo.checkoutInfo.cart_type,
      "shipping_orders": [
        {
          "selected_logistic_channelid": shippingOrder.selected_logistic_channelid,
          "cod_fee": shippingOrder.cod_fee,
          "order_total": shippingOrder.shipping_fee + (data.buyingInfo.cart.cart_item.price * data.buyingInfo.cart.cart_item.quantity),
          "shipping_id": shippingOrder.shipping_id,
          "shopee_shipping_discount_id": shippingOrder.shopee_shipping_discount_id,
          "selected_logistic_channelid_with_warning": shippingOrder.selected_logistic_channelid_with_warning,
          "shipping_fee_discount": shippingOrder.shipping_fee_discount,
          "shipping_group_description": shippingOrder.shipping_group_description,
          "selected_preferred_delivery_time_option_id": 0,
          "buyer_remark": shippingOrder.buyer_remark || "",
          "buyer_address_data": shippingOrder.buyer_address_data,
          "order_total_without_shipping": data.buyingInfo.cart.cart_item.price * data.buyingInfo.cart.cart_item.quantity,
          "tax_payable": shippingOrder.tax_payable,
          "amount_detail": {
            "BASIC_SHIPPING_FEE": shippingOrder.amount_detail.BASIC_SHIPPING_FEE,
            "SELLER_ESTIMATED_INSURANCE_FEE": shippingOrder.amount_detail.SELLER_ESTIMATED_INSURANCE_FEE,
            "SHOPEE_OR_SELLER_SHIPPING_DISCOUNT": shippingOrder.amount_detail.SHOPEE_OR_SELLER_SHIPPING_DISCOUNT,
            "VOUCHER_DISCOUNT": shippingOrder.amount_detail.VOUCHER_DISCOUNT,
            "SHIPPING_DISCOUNT_BY_SELLER": shippingOrder.amount_detail.SHIPPING_DISCOUNT_BY_SELLER,
            "SELLER_ESTIMATED_BASIC_SHIPPING_FEE": shippingOrder.amount_detail.SELLER_ESTIMATED_BASIC_SHIPPING_FEE,
            "SHIPPING_DISCOUNT_BY_SHOPEE": shippingOrder.amount_detail.SHIPPING_DISCOUNT_BY_SHOPEE,
            "INSURANCE_FEE": shippingOrder.amount_detail.INSURANCE_FEE,
            "ITEM_TOTAL": data.buyingInfo.cart.cart_item.price * data.buyingInfo.cart.cart_item.quantity,
            "TAX_EXEMPTION": shippingOrder.amount_detail.TAX_EXEMPTION,
            "shop_promo_only": shippingOrder.amount_detail.shop_promo_only,
            "COD_FEE": shippingOrder.amount_detail.COD_FEE,
            "TAX_FEE": shippingOrder.amount_detail.TAX_FEE,
            "SELLER_ONLY_SHIPPING_DISCOUNT": shippingOrder.amount_detail.SELLER_ONLY_SHIPPING_DISCOUNT
          },
          "buyer_ic_number": shippingOrder.buyer_ic_number || "",
          "fulfillment_info": shippingOrder.fulfillment_info,
          "voucher_wallet_checking_channel_ids": shippingOrder.voucher_wallet_checking_channel_ids,
          "shoporder_indexes": shippingOrder.shoporder_indexes,
          "shipping_fee": shippingOrder.shipping_fee,
          "tax_exemption": shippingOrder.tax_exemption,
          "shipping_group_icon": shippingOrder.shipping_group_icon
        }
      ],
      "disabled_checkout_info": data.buyingInfo.checkoutInfo.disabled_checkout_info,
      "timestamp": data.buyingInfo.checkoutInfo.timestamp,
      "checkout_price_data": {
        "shipping_subtotal": checkoutPriceData.shipping_subtotal,
        "shipping_discount_subtotal": checkoutPriceData.shipping_discount_subtotal,
        "shipping_subtotal_before_discount": checkoutPriceData.shipping_subtotal_before_discount,
        "bundle_deals_discount": checkoutPriceData.bundle_deals_discount,
        "group_buy_discount": checkoutPriceData.group_buy_discount,
        "merchandise_subtotal": data.buyingInfo.cart.cart_item.price * data.buyingInfo.cart.cart_item.quantity,
        "tax_payable": checkoutPriceData.tax_payable,
        "buyer_txn_fee": checkoutPriceData.buyer_txn_fee,
        "credit_card_promotion": checkoutPriceData.credit_card_promotion,
        "promocode_applied": checkoutPriceData.promocode_applied,
        "shopee_coins_redeemed": checkoutPriceData.shopee_coins_redeemed,
        "total_payable": shippingOrder.shipping_fee + (data.buyingInfo.cart.cart_item.price * data.buyingInfo.cart.cart_item.quantity) + checkoutPriceData.buyer_txn_fee,
        "tax_exemption": checkoutPriceData.tax_exemption
      },
      "client_id": data.buyingInfo.checkoutInfo.client_id,
      "promotion_data": {
        "promotion_msg": promotionData.promotion_msg,
        "price_discount": promotionData.price_discount,
        "can_use_coins": promotionData.can_use_coins,
        "voucher_info": promotionData.voucher_info,
        "coin_info": promotionData.coin_info,
        "free_shipping_voucher_info": {
          "free_shipping_voucher_id": promotionData.free_shipping_voucher_info.free_shipping_voucher_id || 0,
          "disabled_reason": promotionData.free_shipping_voucher_info.disabled_reason,
          "free_shipping_voucher_code": promotionData.free_shipping_voucher_info.free_shipping_voucher_code || ""
        },
        "applied_voucher_code": promotionData.applied_voucher_code,
        // ...function (vouchers) {
        //   if (vouchers.length > 0) {
        //     for (const voucher of vouchers) {
        //       if (voucher.promotionid == user.config.promotionid) {
        //         return {
        //           shop_voucher_entrances: [{
        //             "status": true,
        //             "shopid": user.config.shopid
        //           }]
        //         }
        //       }
        //     }
        //   }
        //   return {
        //     shop_voucher_entrances: [{
        //       "status": false,
        //       "shopid": user.config.shopid
        //     }]
        //   }
        // }(user.updateKeranjang.data.shop_vouchers),
        "card_promotion_enabled": promotionData.card_promotion_enabled,
        "invalid_message": promotionData.invalid_message,
        "card_promotion_id": promotionData.card_promotion_id,
        "voucher_code": promotionData.voucher_code,
        "use_coins": promotionData.use_coins
      },
      "dropshipping_info": data.buyingInfo.checkoutInfo.dropshipping_info,
      "selected_payment_channel_data": data.buyingInfo.checkoutInfo.selected_payment_channel_data,
      "shoporders": [
        {
          "shop": shopOrder.shop,
          "buyer_remark": shopOrder.buyer_remark || "",
          "shipping_fee": shopOrder.shipping_fee,
          "order_total": shopOrder.shipping_fee + (data.buyingInfo.cart.cart_item.price * data.buyingInfo.cart.cart_item.quantity),
          "shipping_id": shopOrder.shipping_id,
          "buyer_ic_number": shopOrder.buyer_ic_number || "",
          "items": shopOrder.items,
          "selected_preferred_delivery_time_option_id": shopOrder.selected_preferred_delivery_time_option_id,
          "selected_logistic_channelid": shopOrder.selected_logistic_channelid,
          "cod_fee": shopOrder.cod_fee,
          "tax_payable": shopOrder.tax_payable,
          "buyer_address_data": shopOrder.buyer_address_data,
          "shipping_fee_discount": shopOrder.shipping_fee_discount,
          "tax_info": shopOrder.tax_info,
          "order_total_without_shipping": data.buyingInfo.cart.cart_item.price * data.buyingInfo.cart.cart_item.quantity,
          "tax_exemption": shopOrder.tax_exemption,
          "amount_detail": {
            "BASIC_SHIPPING_FEE": shopOrder.amount_detail.BASIC_SHIPPING_FEE,
            "SELLER_ESTIMATED_INSURANCE_FEE": shopOrder.amount_detail.SELLER_ESTIMATED_INSURANCE_FEE,
            "SHOPEE_OR_SELLER_SHIPPING_DISCOUNT": shopOrder.amount_detail.SHOPEE_OR_SELLER_SHIPPING_DISCOUNT,
            "VOUCHER_DISCOUNT": shopOrder.amount_detail.VOUCHER_DISCOUNT,
            "SHIPPING_DISCOUNT_BY_SELLER": shopOrder.amount_detail.SHIPPING_DISCOUNT_BY_SELLER,
            "SELLER_ESTIMATED_BASIC_SHIPPING_FEE": shopOrder.amount_detail.SELLER_ESTIMATED_BASIC_SHIPPING_FEE,
            "SHIPPING_DISCOUNT_BY_SHOPEE": shopOrder.amount_detail.SHIPPING_DISCOUNT_BY_SHOPEE,
            "INSURANCE_FEE": shopOrder.amount_detail.INSURANCE_FEE,
            "ITEM_TOTAL": data.buyingInfo.cart.cart_item.price * data.buyingInfo.cart.cart_item.quantity,
            "TAX_EXEMPTION": shopOrder.amount_detail.TAX_EXEMPTION,
            "shop_promo_only": shopOrder.amount_detail.shop_promo_only,
            "COD_FEE": shopOrder.amount_detail.COD_FEE,
            "TAX_FEE": shopOrder.amount_detail.TAX_FEE,
            "SELLER_ONLY_SHIPPING_DISCOUNT": shopOrder.amount_detail.SELLER_ONLY_SHIPPING_DISCOUNT
          },
          "ext_ad_info_mappings": []
        }
      ],
      "can_checkout": true,
      "order_update_info": {},
      "buyer_txn_fee_info": data.buyingInfo.buyer_txn_fee_info,
      "captcha_version": 1
    })).post(`https://shopee.co.id/api/v2/checkout/place_order`)
}