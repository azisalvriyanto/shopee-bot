require('dotenv').config()

const {
    Telegraf,
    session
} = require('telegraf');
const mongoose = require('mongoose');
const chalk = require('chalk');

const Curl = require('./helpers/curl')

const bot = new Telegraf(process.env.BOT_TOKEN);

const Data = require('./models/Data');

const express = require('express')
const app = express()

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(chalk.blue(`[info] App is running on port ${ PORT }`));
});

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.get('/', (req, res) => {
    res.render("index");
})

const {
    generateString
} = require('./helpers')

mongoose.connect(
        process.env.MONGODB, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
    .then((res, err) => err ? console.error(chalk.red(`[error] ${err}`)) : console.log(chalk.blue('[info] MongoDB connection successfully.')))
    .catch((err) => console.error(chalk.red(`[error] ${err}`)))

bot.use(session())

bot.telegram.getMe().then(async (botInfo) => {
    console.log(chalk.blue(`[info] bot username: ${botInfo.username}`))
    console.log(chalk.blue(`[info] bot name    : ${botInfo.first_name}`))
}).catch((err) => console.error(chalk.red(`[error] ${err}`)))

bot.use((ctx, next) => {
    if (!ctx.message.chat) return;
    return Data.findOrCreate({
        chatId: ctx.message.chat.id
    }, {
        telegramInfo: {
            username: ctx.message.chat.username,
            firstName: ctx.message.chat.first_name,
            lastName: ctx.message.chat.last_name,
        },
        shopeeInfo: {
            profile: {
                username: null,
                email: null,
                phone: null,
                name: null,
                password: null,
                metaPassword: null,
                address: {}
            },
            cookies: {
                csrftoken: generateString(32)
            },
            login: {},
            metaPayment: {},
        },
        targetInfo: {},
        buyingInfo: {},
    }, async function (err, result, created) {
        if (err) return console.log(chalk.red(`[error] ${err}`))
        if (created) console.log(chalk.green(`[success] account has been created`))

        ctx.data = result
        ctx.data.Curl = Curl
        ctx.data.shopeeInfo.metaPayment = [{
            name_label: "label_shopee_wallet_v2",
            version: 2,
            spm_channel_id: 8001400,
            be_channel_id: 80030,
            name: "ShopeePay",
            enabled: !0,
            channel_id: 8001400
        }, {
            name_label: "label_offline_bank_transfer",
            version: 2,
            spm_channel_id: 8005200,
            be_channel_id: 80060,
            name: "Transfer Bank",
            enabled: !0,
            channel_id: 8005200,
            banks: [{
                bank_name: "Bank BCA (Dicek Otomatis)",
                option_info: "89052001",
                be_channel_id: 80061,
                enabled: !0
            }, {
                bank_name: "Bank Mandiri(Dicek Otomatis)",
                option_info: "89052002",
                enabled: !0,
                be_channel_id: 80062
            }, {
                bank_name: "Bank BNI (Dicek Otomatis)",
                option_info: "89052003",
                enabled: !0,
                be_channel_id: 80063
            }, {
                bank_name: "Bank BRI (Dicek Otomatis)",
                option_info: "89052004",
                be_channel_id: 80064,
                enabled: !0
            }, {
                bank_name: "Bank Syariah Indonesia (BSI) (Dicek Otomatis)",
                option_info: "89052005",
                be_channel_id: 80065,
                enabled: !0
            }, {
                bank_name: "Bank Permata (Dicek Otomatis)",
                be_channel_id: 80066,
                enabled: !0,
                option_info: "89052006"
            }]
        }, {
            channelid: 89e3,
            name_label: "label_cod",
            version: 1,
            spm_channel_id: 0,
            be_channel_id: 89e3,
            name: "COD (Bayar di Tempat)",
            enabled: !0
        }]

        if (process.env.APP_ENV == 'development') {
            return ctx.reply(`Bot is maintenanced, please contact @azisalvriyanto`).then(() => console.log(chalk.red(`[error] ${ctx.data.chatId} try accessing Bot`)))
        } else if (ctx.data.isRan == true && ctx.message.text != '/stop') {
            return ctx.replyWithHTML(`<pre>Bot still run.\n\nProduct Name  : ${ctx.data.targetInfo.product.detail.item.name}\nFlashsale Time: ${ctx.data.targetInfo.time}\nUrl Product   : </pre>${ctx.data.targetInfo.product.url}<pre>\n\nPlease stop for using it again by this command: </pre>/stop`).then(() => console.log(chalk.red(`[error] Bot still run, please stop for using it again.`)))
        }

        return next(ctx)
    })
})

bot.command('login', require('./commands/login'))
bot.command('set', require('./commands/set'))
bot.command('start', require('./commands/start'))
bot.command('stop', require('./commands/stop'))

bot.catch((err, ctx) => console.error(chalk.red(`[error] ${err}`)))
bot.launch()