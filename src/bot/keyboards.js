const { Markup } = require('telegraf');

const pagination = (element, page_size, type) => Markup.inlineKeyboard([
    Markup.button.callback('⏪', JSON.stringify({"command": "get_page", "type": type, "element": 0})),
    Markup.button.callback('◀️', JSON.stringify({"command": "get_page", "type": type, "element": element-page_size})),
    Markup.button.callback('⏹', JSON.stringify({"command": "stop"})),
    Markup.button.callback('▶️', JSON.stringify({"command": "get_page", "type": type, "element": element+page_size})),
    Markup.button.callback('⏩', JSON.stringify({"command": "get_page", "type": type, "element": "last"}))
])

const groups_or_users = () => Markup.inlineKeyboard([
    Markup.button.callback('Users', JSON.stringify({"command": "get_page", "type": "user", "element": 0})),
    Markup.button.callback('Groups', JSON.stringify({"command": "get_page", "type": "group", "element": 0})),
])

module.exports = { pagination, groups_or_users };