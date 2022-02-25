const Data = require('../models/Data');
const chalk = require('chalk');

module.exports = async function (ctx) {
    let data = ctx.data;

    return Data.updateOne({
        chatId: ctx.message.chat.id
    }, {
        isRan: false,
    }).exec(async (err, res) => {
        if (err) return ctx.replyWithHTML(`<pre>Stop the bot failed</pre>`)
        await ctx.replyWithHTML(`<pre>Stop the bot successfully</pre>`)

        return console.log(chalk.blue(`[info] bot has been stopped.`))
    })
}