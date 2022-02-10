const cookie = require('cookie');
const psl = require('psl');
const url = require('url');
const chalk = require('chalk');

const generateString = function (length = 0, chartset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chartset.charAt(Math.floor(Math.random() * chartset.length));
    }

    return result;
}

const setNewCookie = function (oldCookies, newCookies) {
    for (const cookieTemp of newCookies) {
        let parseCookie = cookie.parse(cookieTemp);
        let cookieName = Object.keys(parseCookie)[0]
        oldCookies[cookieName] = parseCookie[cookieName]
    }

    console.log(chalk.blue(`[info] set cookies successfully`))
}

const sleep = async function (ms) {
    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}

const getCommands = function (str) {
    return str.split(' ')
}

const addDots = function (nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    let rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + '.' + '$2');
    }
    return x1 + x2;
}

const isValidURL = function (string) {
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}

const extractHostname = function (url) {
    let hostname;
    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    } else {
        hostname = url.split('/')[0];
    }

    hostname = hostname.split(':')[0];
    hostname = hostname.split('?')[0];
    return hostname;
}

const extractRootDomain = function (url) {
    let domain = extractHostname(url),
        splitArr = domain.split('.'),
        arrLen = splitArr.length;

    if (arrLen > 2) {
        domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
        if (splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2) {
            domain = splitArr[arrLen - 3] + '.' + domain;
        }
    }

    return domain;
}

const parseShopeeUrl = function (productUrl) {
    let chunk = {
        data: {
            shopId: null,
            itemId: null,
            url: productUrl,
            link: `<a href="${productUrl}">${productUrl}</a>`,
        },
        err: null
    }
    if (!isValidURL(productUrl) || psl.get(extractRootDomain(productUrl)) != 'shopee.co.id') {
        chunk.err = 'Url format is wrong'
        return chunk
    }

    let pathname = url.parse(productUrl, true).pathname.split('/')
    if (pathname.length == 4) {
        chunk.data.itemId = parseInt(pathname[3])
        chunk.data.shopId = parseInt(pathname[2])
    } else {
        pathname = pathname[1].split('.')
        chunk.data.itemId = parseInt(pathname[pathname.length - 1])
        chunk.data.shopId = parseInt(pathname[pathname.length - 2])
    }

    if (!Number.isInteger(chunk.data.itemId) || !Number.isInteger(chunk.data.shopId)) {
        chunk.err = `It's not shopee product`
    }

    return chunk
}

const handleRupiahFormat = (number, prefix) => {
    var nominal = number;
    var numberString = number.replace(/[^,\d]/g, '').toString(),
        split = numberString.split(','),
        sisa = split[0].length % 3,
        rupiah = split[0].substr(0, sisa),
        ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
        separator = sisa ? '.' : '';
        rupiah += separator + ribuan.join('.');
    }

    rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
    return (nominal < 0 ? '- ' : '') + (prefix == undefined ? ("Rp" + rupiah) : (rupiah ? prefix + rupiah : 0));
}

module.exports = {
    generateString,
    setNewCookie,
    sleep,
    getCommands,
    addDots,
    parseShopeeUrl,
    handleRupiahFormat,
}