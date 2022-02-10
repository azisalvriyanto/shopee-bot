const Data = require('../models/Data');

module.exports = async function (ctx) {
    let data = ctx.data;

    return Data.updateOne({
        chatId: ctx.message.chat.id
    }, {
        isRan: false,
    }).exec(async (err, res) => {
        if (err) return ctx.replyWithHTML(`<pre>Stop the bot failed</pre>`)

        // await data.tasks.notification.stop()
        // await data.tasks.notification.destroy()
        // await data.tasks.bot.stop()
        // await data.tasks.bot.destroy()

        return ctx.replyWithHTML(`<pre>Stop the bot successfully</pre>`)
    })
}