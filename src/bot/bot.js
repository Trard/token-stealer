const { Telegraf, Markup } = require('telegraf')
const { get_messages } = require('./handler.js')

const bot = new Telegraf(process.env.STEALER_TELEGRAM_TOKEN)

const start_bot = (collection) => {
    const pagination_markup = Markup.inlineKeyboard([
        Markup.button.callback('⏪', 'first_page'),
        Markup.button.callback('◀️', 'prev_page'),
        Markup.button.callback('⏹', 'stop'),
        Markup.button.callback('▶️', 'next_page'),
        Markup.button.callback('⏩', 'last_page')
    ])

    bot.start((ctx) => {
        ctx.reply('Hello!', Markup
            .keyboard(['/github'])
            .resize()
        )
    })

    bot.command('github', (ctx) => {
        ctx.reply(
            'Choose users or groups',
            Markup.inlineKeyboard([
                Markup.button.callback('Users', 'get_users'),
                Markup.button.callback('Groups', 'get_groups'),
            ])
        )
    })
    
    bot.action('get_groups', async (ctx) => {
        await ctx.answerCbQuery()
        let accounts = await collection.find({type: "group"}).toArray()
        let strings = await get_messages(accounts)
        await ctx.editMessageText(strings.join('\n'), {
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
            ...pagination_markup,
        })
    })
    
    bot.action('get_users', async (ctx) => {
        await ctx.answerCbQuery()
        let accounts = await collection.find({type: "user"}).toArray()
        let strings = await get_messages(accounts)
        await ctx.editMessageText(strings.join('\n'), {
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
            ...pagination_markup,
        })
    })

    bot.action('first_page', async (ctx) => {
        console.log(ctx)
        await ctx.answerCbQuery()
        await ctx.editMessageText(
            'Text',
            pagination_markup
        )
    })

    bot.action('next_page', async (ctx) => {
        await ctx.answerCbQuery()
        await ctx.editMessageText(
            'Text',
            pagination_markup
        )
    })

    bot.action('stop', async (ctx) => {
        await ctx.answerCbQuery()
        await ctx.editMessageText(
            'Choose users or groups',
            Markup.inlineKeyboard([
                Markup.button.callback('Users', 'get_users'),
                Markup.button.callback('Groups', 'get_groups'),
            ])
        )
    })

    bot.action('prev_page', async (ctx) => {
        await ctx.answerCbQuery()
        await ctx.editMessageText(
            'Text',
            pagination_markup
        )
    })

    bot.action('last_page', async (ctx) => {
        await ctx.answerCbQuery()
        await ctx.editMessageText(
            'Text',
            pagination_markup
        )
    })

    bot.launch()

    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
}

module.exports = { start_bot }