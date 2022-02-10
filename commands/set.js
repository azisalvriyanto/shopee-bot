const crypto = require('crypto');
const chalk = require('chalk');
const Data = require('../models/Data');
const url = require('url');

const getProduct = require('../requests/products/getProduct');

const {
    setNewCookie,
    getCommands,
    parseShopeeUrl,
} = require('../helpers')

module.exports = async function (ctx) {
    let data = ctx.data;
    data.commands = getCommands(ctx.message.text)

    if (data.commands.length <= 2) {
        return ctx.reply(`<pre>Your command is wrong, usage: /set [-username (value)] [-email (value)] [-phone (value)] [-password (value)] [-product (product url)] [-model (model id of product)] [-time (flassale time)] [-payment (-bank|-shopeepay|-cod) (payment detail)] [-logistic (logistic id)]</pre>`, {
            parse_mode: 'HTML'
        })
    } else if (data.commands[1] == '-username' || data.commands[1] == '-email' || data.commands[1] == '-phone' || data.commands[1] == '-password') {
        await ctx.replyWithHTML(`<b>[Set Profle]</b>`)

        let parameter = data.commands[1].replace("-", "")
        if (parameter == 'password') {
            data.shopeeInfo.profile.metaPassword = data.commands[2]
            let md5pass = crypto.createHash('md5').update(data.shopeeInfo.profile.metaPassword).digest('hex')
            data.shopeeInfo.profile.password = crypto.createHash('sha256').update(md5pass).digest('hex')
        } else {
            data.shopeeInfo.profile[parameter] = data.commands[2]
        }

        await ctx.replyWithHTML(`<pre>Username : ${data.shopeeInfo.profile.username}\nEmail    : ${data.shopeeInfo.profile.email}\nPhone    : ${data.shopeeInfo.profile.phone}</pre>`)
        return Data.updateOne({
            chatId: ctx.message.chat.id
        }, {
            shopeeInfo: {
                ...data.shopeeInfo,
                profile: data.shopeeInfo.profile
            },
        }).exec(async (err, res) => {
            if (err) return ctx.replyWithHTML(`<pre>Set ${parameter} failed</pre>`).then(() => console.log(chalk.red(`[error] ${err}`))).catch((err) => console.log(chalk.red(`[error] ${err}`)))
        })
    } else if (data.commands[1] == '-product') {
        await ctx.replyWithHTML(`<b>[Set Product]</b>`)

        let productUrl = data.commands[2]
        let validateProductUrl = parseShopeeUrl(productUrl)

        if (validateProductUrl.err) {
            return ctx.replyWithHTML(`<pre>${validateProductUrl.err}, please correct the link: </pre>${validateProductUrl.data.url}`)
        } else {
            productUrl = validateProductUrl.data.url
            await ctx.replyWithHTML(`<pre>Set product using </pre>${productUrl}`)
        }

        data.targetInfo.product = {
            url: productUrl,
            shopId: validateProductUrl.data.shopId,
            itemId: validateProductUrl.data.itemId,
            modelId: null,
            model: {},
            detail: {}
        }

        return getProduct(data).then(async ({
            statusCode,
            body,
            headers,
            curlInstance,
            curl
        }) => {
            setNewCookie(data.shopeeInfo.cookies, headers['set-cookie'])
            data.targetInfo.product.detail = typeof body == 'string' ? JSON.parse(body) : body

            if (data.targetInfo.product.detail.error == null) {
                data.targetInfo.product.shopId = data.targetInfo.product.detail.item.shopid
                data.targetInfo.product.itemId = data.targetInfo.product.detail.item.itemid

                var modelText = ''
                data.targetInfo.product.detail.item.models.forEach((model, j) => {
                    modelText += `\n<pre>[${(j = j+1) <= 9 ? '0' : ''}${j}] ${model.name}\n     </pre><pre>/set -model ${model.modelid}</pre>`
                })
                await ctx.replyWithHTML(`<pre>Product Information\nName    : ${data.targetInfo.product.detail.item.name}\nShop Id : ${data.targetInfo.product.shopId}\nItem Id : ${data.targetInfo.product.itemId}\nModel Id: ${data.targetInfo.product.modelId}\n\nPlease set model id for selecting the item using these commands.</pre>${modelText}`)
            } else {
                data.targetInfo.product.shopId = null
                data.targetInfo.product.itemId = null
            }

            return Data.updateOne({
                chatId: ctx.message.chat.id
            }, {
                targetInfo: {
                    ...data.targetInfo,
                    product: data.targetInfo.product
                },
            }).exec(async (err, res) => {
                if (err) return ctx.replyWithHTML(`<pre>Set product failed</pre>`).then(() => console.log(chalk.red(`[error] ${err}`))).catch((err) => console.log(chalk.red(`[error] ${err}`)))
            })
        }).catch((err) => console.log(chalk.red(`[error] ${err}`)))
    } else if (data.commands[1] == '-model') {
        await ctx.replyWithHTML(`<b>[Set Product Model]</b>`)

        if (data.targetInfo.product && data.targetInfo.product.detail && data.targetInfo.product.detail.item) {
            data.targetInfo.product.model = data.targetInfo.product.detail.item.models.find(record => record.modelid == data.commands[2])
            if (data.targetInfo.product.model) {
                data.targetInfo.product.modelId = data.targetInfo.product.model.modelid
            } else {
                await ctx.replyWithHTML(`<pre>Product model (${data.commands[2]}) not found.</pre>`)
            }
        } else {
            return ctx.replyWithHTML(`<pre>Product model (${data.commands[2]}) not found.</pre>`)
        }

        return Data.updateOne({
            chatId: ctx.message.chat.id
        }, {
            targetInfo: {
                ...data.targetInfo,
                product: {
                    ...data.targetInfo.product,
                    modelId: data.targetInfo.product.modelId,
                    model: data.targetInfo.product.model
                }
            },
        }).exec(async (err, res) => {
            if (err) return ctx.replyWithHTML(`<pre>Set product model failed</pre>`).then(() => console.log(chalk.red(`[error] ${err}`))).catch((err) => console.log(chalk.red(`[error] ${err}`)))

            return await ctx.replyWithHTML(`<pre>Product Information\nName    : ${data.targetInfo.product.detail.item.name}\nShop Id : ${data.targetInfo.product.shopId}\nItem Id : ${data.targetInfo.product.itemId}\nModel Id: ${data.targetInfo.product.modelId} (${data.targetInfo.product.model.name})\nUrl     : </pre>${data.targetInfo.product.url}`)
        })
    } else if (data.commands[1] == '-time') {
        await ctx.replyWithHTML(`<b>[Set Flashsale Time]</b>`)

        data.targetInfo.time = data.commands[2] + ' ' + data.commands[3]
        if (Date.parse(`${data.targetInfo.time} `)) {
            ctx.replyWithHTML(`<pre>You will start flashsale at ${data.targetInfo.time}</pre>`)
        } else {
            data.targetInfo.time == null
            ctx.replyWithHTML(`<pre>Set flashsale time failed, use this format:\n</pre><pre>/set -time YYYY-MM-DD HH:ii:ss</pre>\n\n<pre>Example: </pre><pre>/set -time 2022-02-08 09:08:00</pre>`)
        }

        return Data.updateOne({
            chatId: ctx.message.chat.id
        }, {
            targetInfo: {
                ...data.targetInfo,
                time: data.targetInfo.time
            },
        }).exec(async (err, res) => {
            if (err) return ctx.replyWithHTML(`<pre>Set time failed</pre>`).then(() => console.log(chalk.red(`[error] ${err}`))).catch((err) => console.log(chalk.red(`[error] ${err}`)))
        })
    } else if (data.commands[1] == '-address') {
        await ctx.replyWithHTML(`<b>[Set Address]</b>`)

        let addressId = parseInt(data.commands[2])
        data.targetInfo.address = data.shopeeInfo.profile.address.addresses.find(record => record.id === addressId)
        if (data.targetInfo.address) {
            await ctx.replyWithHTML(`<pre>Addres Information\nName    : ${data.targetInfo.address.name}\nPhone   : ${data.targetInfo.address.phone}\nAddress : ${data.targetInfo.address.address}\nDistrict: ${data.targetInfo.address.district}\nCity    : ${data.targetInfo.address.city}\nState   : ${data.targetInfo.address.state}\nCountry : ${data.targetInfo.address.country} - ${data.targetInfo.address.zipcode}</pre>`)
        } else {
            data.targetInfo.address = {}
            ctx.replyWithHTML(`<pre>Set address failed, use this format:\n</pre><pre>/set -address address id</pre>\n\n<pre>Example: </pre><pre>/set -address 42151337</pre>`)
        }

        return Data.updateOne({
            chatId: ctx.message.chat.id
        }, {
            targetInfo: {
                ...data.targetInfo,
                address: data.targetInfo.address
            },
        }).exec(async (err, res) => {
            if (err) return ctx.replyWithHTML(`<pre>Set address failed.</pre>`).then(() => console.log(chalk.red(`[error] ${err}`))).catch((err) => console.log(chalk.red(`[error] ${err}`)))
        })
    } else if (data.commands[1] == '-payment') {
        await ctx.replyWithHTML(`<b>[Set Payment]</b>`)

        let paymentMethod = data.commands[2]
        let paymentDetail = null
        if (paymentMethod == '-bank') {
            paymentMethod = data.shopeeInfo.metaPayment.find(record => record.spm_channel_id == 8005200)
            if (paymentMethod && data.commands[3]) {
                paymentDetail = paymentMethod.banks.find(record => record.option_info == data.commands[3])

                if (!paymentDetail) {
                    paymentMethod = null
                }
            } else {
                paymentMethod = null
            }
        } else {
            let spmChannelId = 0
            if (paymentMethod == '-shopeepay') {
                spmChannelId = 8001400
            }
            paymentMethod = data.shopeeInfo.metaPayment.find(record => record.spm_channel_id === spmChannelId)
        }

        if (paymentMethod) {
            ctx.replyWithHTML(`<pre>Payment Information\nName  : ${paymentMethod.name}${paymentDetail ? `\nDetail: ${paymentDetail.bank_name}` : ``}</pre>`)
        } else {
            ctx.replyWithHTML(`<pre>Set payment failed, use this format:\n</pre><pre>/set -payment [-shopeepay|-bank||-cod] [bank id (option)]</pre>\n\n<pre>Example:\n</pre><pre>/set -payment -shopeepay</pre><pre>\n</pre><pre>/set -payment -bank 89052001</pre><pre>\n</pre><pre>/set -payment -cod</pre>`)
        }

        data.targetInfo.payment = {
            method: paymentMethod,
            detail: paymentDetail
        }
        return Data.updateOne({
            chatId: ctx.message.chat.id
        }, {
            targetInfo: {
                ...data.targetInfo,
                payment: data.targetInfo.payment
            },
        }).exec(async (err, res) => {
            if (err) return ctx.replyWithHTML(`<pre>Set payment failed.</pre>`).then(() => console.log(chalk.red(`[error] ${err}`))).catch((err) => console.log(chalk.red(`[error] ${err}`)))
        })
    } else if (data.commands[1] == '-logistic') {
        await ctx.replyWithHTML(`<b>[Set Logistic]</b>`)

        let logisticId = parseInt(data.commands[2])

        data.targetInfo.logisticId = logisticId
        return Data.updateOne({
            chatId: ctx.message.chat.id
        }, {
            targetInfo: {
                ...data.targetInfo,
                logisticId: data.targetInfo.logisticId
            },
        }).exec(async (err, res) => {
            if (err) return ctx.replyWithHTML(`<pre>Set logistic failed</pre>`).then(() => console.log(chalk.red(`[error] ${err}`))).catch((err) => console.log(chalk.red(`[error] ${err}`)))
        })
    }
}