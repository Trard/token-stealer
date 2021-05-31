const { Telegraf, Markup } = require('telegraf')
const { pagination, groups_or_users } = require('../src/bot/keyboards')

const bot = new Telegraf(process.env.STEALER_TELEGRAM_TOKEN)

keyboard = pagination(Markup)

console.log(keyboard.reply_markup.inline_keyboard)