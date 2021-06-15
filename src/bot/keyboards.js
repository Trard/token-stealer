const { Markup } = require('telegraf');

const pagination = (element, page_size) => Markup.inlineKeyboard([
    Markup.button.callback('⏪', JSON.stringify({"command": "get_page", "element": 0})),
    Markup.button.callback('◀️', JSON.stringify({"command": "get_page", "element": element-page_size-1})),
    Markup.button.callback('⏹', JSON.stringify({"command": "stop"})),
    Markup.button.callback('▶️', JSON.stringify({"command": "get_page", "element": element+page_size+1})),
    Markup.button.callback('⏩', JSON.stringify({"command": "get_page", "element": "last"}))
]);

const groups_or_users = () => Markup.inlineKeyboard([
    Markup.button.callback('Users', JSON.stringify({"command": "get_page", "type": "users", "element": 0})),
    Markup.button.callback('Groups', JSON.stringify({"command": "get_page", "type": "groups", "element": 0})),
]);

module.exports = { pagination, groups_or_users };