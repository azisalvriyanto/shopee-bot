const crypto = require('crypto');
const chalk = require('chalk');
const Data = require('../models/Data');

const getAddress = require('../requests/users/getAddress');
const getLogin = require('../requests/auth/getLogin');
const postLogin = require('../requests/auth/postLogin');
const postLoginMethod = require('../requests/auth/postLoginMethod');
const postLoginLinkVerify = require('../requests/auth/postLoginLinkVerify');
const postLoginTokenVerify = require('../requests/auth/postLoginTokenVerify');
const postStatusLogin = require('../requests/auth/postStatusLogin');
const postLoginDone = require('../requests/auth/postLoginDone');

const {
    setNewCookie,
    sleep,
    getCommands,
} = require('../helpers')

module.exports = function (ctx) {
    let data = ctx.data;
    data.commands = getCommands(ctx.message.text)

    return getAddress(data).then(async ({
        statusCode,
        body,
        headers,
        curlInstance,
        curl
    }) => {
        curl.close()
        setNewCookie(data.shopeeInfo.cookies, headers['set-cookie'])

        if (data.commands.length == 2 && data.commands[1] == '-relogin') {
            await ctx.reply(`<pre>[Relogin]</pre>`, {
                parse_mode: 'HTML'
            })

            ctx.data.shopeeInfo.cookies = {
                csrftoken: generateString(32)
            }
        } else {
            await ctx.reply(`<pre>[Login]</pre>`, {
                parse_mode: 'HTML'
            })
            body = typeof body == 'string' ? JSON.parse(body) : body
            data.shopeeInfo.profile.address = body
            if (body && !body.error) {
                await Data.updateOne({
                    chatId: ctx.message.chat.id
                }, {
                    shopeeInfo: {
                        ...data.shopeeInfo,
                        profile: {
                            ...data.shopeeInfo.profile,
                            address: data.shopeeInfo.profile.address,
                        }
                    },
                }).exec(async (err, res) => {
                    if (err) return ctx.reply(`Data update failed`).then(() => console.log(chalk.red(`[error] ${err}`))).catch((err) => console.log(chalk.red(`[error] ${err}`)))
                    console.log(chalk.green(`[success] account loged successfully`))
                })

                return ctx.reply(`<pre>You have been logged.</pre>`, {
                    parse_mode: 'HTML'
                })
            }
        }

        await getLogin(data).then(({
            statusCode,
            body,
            headers,
            curlInstance,
            curl
        }) => {
            curl.close()
            setNewCookie(data.shopeeInfo.cookies, headers['set-cookie'])
        }).catch((err) => console.log(chalk.red(`[error] ${err}`)))

        return postLogin(data).then(async ({
            statusCode,
            body,
            headers,
            curlInstance,
            curl
        }) => {
            curl.close()
            setNewCookie(data.shopeeInfo.cookies, headers['set-cookie'])

            data.shopeeInfo.login = {
                auth: typeof body == 'string' ? JSON.parse(body) : body
            }
            switch (data.shopeeInfo.login.auth.error) {
                case 1:
                    return ctx.reply(`<pre>There is error.</pre>`, {
                        parse_mode: 'HTML'
                    })
                case 2:
                    return ctx.reply(`<pre>Your account or password is wrong, please try again.</pre>`, {
                        parse_mode: 'HTML'
                    })
                case 98:
                    await postLoginMethod(data).then(({
                        statusCode,
                        body,
                        headers,
                        curlInstance,
                        curl
                    }) => {
                        curl.close()
                        setNewCookie(data.shopeeInfo.cookies, headers['set-cookie'])

                        data.shopeeInfo.login.method = typeof body == 'string' ? JSON.parse(body) : body;
                        if (data.shopeeInfo.login.method && data.shopeeInfo.login.method.data.length == 0) {
                            return ctx.reply(`<pre>Oops, we can't verify your login. Please call Customer Service for helping you.</pre>`, {
                                parse_mode: 'HTML'
                            })
                        }
                    }).catch((err) => console.log(chalk.red(`[error] ${err}`)))

                    await postLoginLinkVerify(data).then(({
                        statusCode,
                        body,
                        headers,
                        curlInstance,
                        curl
                    }) => {
                        curl.close()
                        setNewCookie(data.shopeeInfo.cookies, headers['set-cookie'])

                        data.shopeeInfo.login.verify = typeof body == 'string' ? JSON.parse(body) : body;
                        if (data.shopeeInfo.login.verify.error && data.shopeeInfo.login.verify.error == 81900202) {
                            return ctx.reply(`<pre>Verification failed, you have been limit for verifiying by auth link today.</pre>`, {
                                parse_mode: 'HTML'
                            })
                        }
                    }).catch((err) => console.log(chalk.red(`[error] ${err}`)))

                    ctx.reply(`<pre>Please check WA notification in your phone.</pre>`, {
                        parse_mode: 'HTML'
                    })
                    do {
                        await postStatusLogin(data).then(({
                            statusCode,
                            body,
                            headers,
                            curlInstance,
                            curl
                        }) => {
                            curl.close()
                            setNewCookie(data.shopeeInfo.cookies, headers['set-cookie'])

                            data.shopeeInfo.login.checkStatus = typeof body == 'string' ? JSON.parse(body) : body;
                            if (data.shopeeInfo.login.checkStatus.data.link_status == 4) {
                                return ctx.reply(`<pre>Login failed, try again.</pre>`, {
                                    parse_mode: 'HTML'
                                })
                            }
                        }).catch((err) => console.log(chalk.red(`[error] ${err}`)))

                        await sleep(1000);
                    } while (data.shopeeInfo.login.checkStatus.data.link_status != 2);

                    await postLoginTokenVerify(data).then(({
                        statusCode,
                        body,
                        headers,
                        curlInstance,
                        curl
                    }) => {
                        curl.close()
                        setNewCookie(data.shopeeInfo.cookies, headers['set-cookie'])

                        data.shopeeInfo.login.tokenVerify = typeof body == 'string' ? JSON.parse(body) : body;
                    }).catch((err) => console.log(chalk.red(`[error] ${err}`)))

                    await postLoginDone(data).then(async ({
                        statusCode,
                        body,
                        headers,
                        curlInstance,
                        curl
                    }) => {
                        curl.close()
                        setNewCookie(data.shopeeInfo.cookies, headers['set-cookie'])

                        data.shopeeInfo.login.status = typeof body == 'string' ? JSON.parse(body) : body;
                        if (data.shopeeInfo.login.status.data) {
                            await ctx.reply(`<pre>Login successfully</pre>`, {
                                parse_mode: 'HTML'
                            })
                            await ctx.reply(`<pre>Username : ${data.shopeeInfo.profile.username}\nEmail    : ${data.shopeeInfo.profile.email}\nPhone    : ${data.shopeeInfo.profile.phone}</pre>`, {
                                parse_mode: 'HTML'
                            })
                        } else {
                            await ctx.reply(`<pre>Login failed</pre>`, {
                                parse_mode: 'HTML'
                            })
                        }
                    }).catch((err) => console.log(chalk.red(`[error] ${err}`)))
                    break;
                default:
                    return ctx.reply(`There is error in API.`, {
                        parse_mode: 'HTML'
                    })
            }

            return Data.updateOne({
                chatId: ctx.message.chat.id
            }, {
                shopeeInfo: data.shopeeInfo,
            }).exec(async (err, res) => {
                if (err) return ctx.reply(`Data update failed`).then(() => console.log(chalk.red(`[error] ${err}`))).catch((err) => console.log(chalk.red(`[error] ${err}`)))
                console.log(chalk.green(`[success] account loged successfully`))
            })
        }).catch((err) => console.log(chalk.red(`[error] ${err}`)))
    }).catch((err) => console.log(chalk.red(`[error] ${err}`)))
}