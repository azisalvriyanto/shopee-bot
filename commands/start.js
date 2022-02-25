const crypto = require('crypto');
const chalk = require('chalk');
const Data = require('../models/Data');
const cron = require('node-cron');

const postCart = require('../requests/buyings/postCart');
const postCartInfo = require('../requests/buyings/postCartInfo');
const postCheckout = require('../requests/buyings/postCheckout');
const postCheckoutInfo = require('../requests/buyings/postCheckoutInfo');
const postOrder = require('../requests/buyings/postOrder');

const {
    setNewCookie,
    handleRupiahFormat,
    sleep
} = require('../helpers')

module.exports = async function (ctx) {
    let data = ctx.data;

    await ctx.replyWithHTML(`<b>[Running]</b>`)
    let dateTime = new Date(data.targetInfo.time)
    let currentTime = new Date()
    currentTimeString = currentTime.getFullYear() + '-' + ("0" + (currentTime.getMonth()+1)).slice(-2) + '-' + ("0" + currentTime.getDate()).slice(-2) + ' ' + ("0" + currentTime.getHours()).slice(-2) + ':' + ("0" + currentTime.getMinutes()).slice(-2) + ':' + ("0" + currentTime.getSeconds()).slice(-2)
    if (dateTime >= currentTime) {
        await ctx.replyWithHTML(`<pre>It's ${currentTimeString} now. The notification will be sent to you a minute before flashsale time at ${data.targetInfo.time}.\n\nProduct Name: ${data.targetInfo.product.detail.item.name}</pre>`)

        data.isRan = true
        await Data.updateOne({
            chatId: ctx.message.chat.id
        }, {
            isRan: data.isRan
        }).exec()
    } else {
        currentTime.setMinutes(currentTime.getMinutes() + 5)
        let currentTimeStringTemp = currentTime.getFullYear() + '-' + ("0" + (currentTime.getMonth()+1)).slice(-2) + '-' + ("0" + currentTime.getDate()).slice(-2) + ' ' + ("0" + currentTime.getHours()).slice(-2) + ':' + ("0" + currentTime.getMinutes()).slice(-2) + ':00'
        return ctx.replyWithHTML(`<pre>It's ${currentTimeString} now and the flashsale time is ${data.targetInfo.time}. The flashsale time is smaller than current time, please change the flashsale time to future time.\n\nExample: </pre><pre>/set -time ${currentTimeStringTemp}</pre>`)
    }

    let dateTimeTemp = new Date(data.targetInfo.time)
    dateTimeTemp.setMinutes(dateTimeTemp.getMinutes() - 1);
    data.tasks.notification = cron.schedule(`${dateTimeTemp.getMinutes()} ${dateTimeTemp.getHours()} * * *`, async function() {
        await ctx.replyWithHTML(`<pre>A minute left, please wait.\n\nProduct Name: ${data.targetInfo.product.detail.item.name}</pre>`)

        await data.tasks.notification.stop()
        await data.tasks.notification.destroy()
    }, {
        name: `${data.telegramInfo.username} - ${data.shopeeInfo.login.status.data.userid} - notification`,
        scheduled: true,
        timezone: process.env.TIMEZONE
    })
    await data.tasks.notification.start()

    var text = ''
    data.tasks.bot = cron.schedule(`${dateTime.getMinutes()} ${dateTime.getHours()} * * *`, async function() {
        text += `\n<pre>[Start Time]</pre>`
        text += `\n<pre>${new Date()}</pre>`
        text += `\n`
        text += '\n<pre>[Add To Cart]</pre>'
        text += `\n<pre>Name: ${data.targetInfo.product.detail.item.name}</pre>`

        await sleep(0001);

        await postCart(data).then(async ({
            statusCode,
            body,
            headers,
            curlInstance,
            curl
        }) => {
            curl.close()
            setNewCookie(data.shopeeInfo.cookies, headers['set-cookie'])

            data.buyingInfo = {
                cart: {}
            }
            body = typeof body == 'string' ? JSON.parse(body) : body
            if (body.error == 0) {
                data.buyingInfo.cart = body.data
                data.buyingInfo.cart.note = "Product can be added to cart"
            } else {
                data.buyingInfo.cart.note = "Product can't be added to cart"
            }
            text += `\n<pre>Note: ${data.buyingInfo.cart.note}</pre>`
        }).catch((err) => console.log(chalk.red(`[error] ${err}`)))

        text += `\n`
        text += `\n<pre>[Checkout]</pre>`
        await postCheckoutInfo(data).then(async ({
            statusCode,
            body,
            headers,
            curlInstance,
            curl
        }) => {
            curl.close()
            setNewCookie(data.shopeeInfo.cookies, headers['set-cookie'])

            body = typeof body == 'string' ? JSON.parse(body) : body
            data.buyingInfo.checkoutInfo = body
            if (!body.error) {
                text += `\n<pre>Flashsale Time: ${data.targetInfo.time}</pre>`
                text += `\n<pre>Payment       : ${data.targetInfo.payment.method.name}</pre>`
                if (data.targetInfo.payment.method.name == 'ShopeePay') {
                    text += `\n<pre>ShopeePay     : ${handleRupiahFormat(body.payment_channel_info.channels[0].balance.toString().replace('00000', ''))}</pre>`
                }
                text += `\n<pre>Item Price    : ${handleRupiahFormat(body.checkout_price_data.merchandise_subtotal.toString().replace('00000', ''))}</pre>`
                text += `\n<pre>Shipping Cost : ${handleRupiahFormat(body.checkout_price_data.shipping_subtotal.toString().replace('00000', ''))}</pre>`
                text += `\n<pre>Buyer Fee     : ${handleRupiahFormat(body.checkout_price_data.buyer_txn_fee.toString().replace('00000', ''))}</pre>`
                text += `\n<pre>Total         : ${handleRupiahFormat(body.checkout_price_data.total_payable.toString().replace('00000', ''))}</pre>`

                text += `\n`
                text += `\n<pre>[Order]</pre>`
                await postOrder(data).then(async ({
                    statusCode,
                    body,
                    headers,
                    curlInstance,
                    curl
                }) => {
                    curl.close()
                    setNewCookie(data.shopeeInfo.cookies, headers['set-cookie'])

                    body = typeof body == 'string' ? JSON.parse(body) : body
                    data.buyingInfo.order = body
                    if (body.redirect_url) {
                        text += `\n<pre>Url: </pre>${body.redirect_url}`
                    } else {
                        text += `\n<pre>Error: ${body.error_msg}</pre>`
                    }
                }).catch((err) => console.log(chalk.red(`[error] ${err}`)))
            } else {
                text += `\n<pre>Error: ${body.error_msg}</pre>`
            }
        }).catch((err) => console.log(chalk.red(`[error] ${err}`)))

        text += `\n`
        text += `\n<pre>[End Time]</pre>`
        text += `\n<pre>${new Date()}</pre>`
        await ctx.replyWithHTML(`${text}`)

        await Data.updateOne({
            chatId: ctx.message.chat.id
        }, {
            isRan: false
        }).exec()

        await Data.updateOne({
            chatId: ctx.message.chat.id
        }, {
            shopeeInfo: {
                ...data.shopeeInfo,
                cookies: data.shopeeInfo.cookies
            }
        }).exec()

        await Data.updateOne({
            chatId: ctx.message.chat.id
        }, {
            buyingInfo: data.buyingInfo
        }).exec()

        await data.tasks.bot.stop()
        await data.tasks.bot.destroy()

        return console.log(chalk.blue(`[info] bot has been finished.`))
    }, {
        name: `${data.telegramInfo.username} - ${data.shopeeInfo.login.status.data.userid} - bot`,
        scheduled: true,
        timezone: process.env.TIMEZONE
    })
    await data.tasks.bot.start()
}