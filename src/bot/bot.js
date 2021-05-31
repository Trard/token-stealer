'use strict'
const { Telegraf, Markup } = require('telegraf')
const { get_messages } = require('./handler.js')
const { pagination, groups_or_users } = require('./keyboards.js')

const bot = new Telegraf(process.env.STEALER_TELEGRAM_TOKEN)

const start_bot = (collection) => {
    //handler
    bot.use(async (ctx, next) => {
        if (ctx.update.callback_query) {
            await ctx.answerCbQuery()
            try {
                ctx.state = JSON.parse(ctx.callbackQuery.data);
                ctx.callbackQuery.data = ctx.state.command
            } catch (e) {
                console.log(e)
                return;
            }
        }
        await next()
    })

    bot.start((ctx) => {
        ctx.reply('Hello!', Markup
            .keyboard(['/github'])
            .resize()
        )
    })

    bot.command('github', (ctx) => {
        ctx.reply(
            'Choose users or groups',
            groups_or_users()
        )
    })

    bot.action('stop', async (ctx) => {
        await ctx.editMessageText(
            'Choose users or groups',
            {
                ...groups_or_users()
            }
        )
    })

    bot.action("get_page", async (ctx) => {
        let page_size = 3;
        let last_element = await collection.countDocuments( { type: ctx.state.type } )

        if ( ctx.state.element === "last") {
            ctx.state.element = last_element - page_size
        } else if (ctx.state.element < 0) {
            ctx.state.element = 0
        }

        if (ctx.state.element >= 0 && ctx.state.element < last_element) {
            let accounts = await collection
                .find( { type: ctx.state.type } )
                .sort( { members: -1, _id: 1 } )
                .skip(ctx.state.element)
                .limit(page_size)
                .toArray()

            let message = ( await get_messages(accounts) ).join('\n')
            try {
                await ctx.editMessageText(
                    message, {
                        parse_mode: 'Markdown',
                        disable_web_page_preview: true,
                        ...pagination(ctx.state.element, page_size, ctx.state.type),
                    }
                )
            } catch {}
        }
    })

    bot.launch()

    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
}

module.exports = { start_bot }