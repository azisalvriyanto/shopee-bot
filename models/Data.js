const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');

module.exports = mongoose.model('shopee', new mongoose.Schema({
    chatId: Number,
    telegramInfo: {
        username: String,
        firstName: String,
        lastName: String,
    },
    shopeeInfo: {
        profile: {
            username: String,
            email: String,
            phone: String,
            name: String,
            password: String,
            metaPassword: String,
            address: Object,
        },
        cookies: Object,
        login: Object,
        metaPayment: Object,
    },
    targetInfo: Object,
    buyingInfo: Object,
    isRan: Boolean,
    tasks: {
        notification: Object,
        bot: Object,
    },
}).plugin(findOrCreate))