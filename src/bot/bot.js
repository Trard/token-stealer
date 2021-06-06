const { Telegraf, Markup } = require('telegraf')

const { session } = require('../../lib/message_session')
const { get_messages } = require('./handler.js')
const { pagination, groups_or_users } = require('./keyboards.js')

const start_bot = (db, page_size) => {
    //init
    const bot = new Telegraf(process.env.STEALER_TELEGRAM_TOKEN);
    //db
    const accounts = db.collection("accounts");
    const logs = db.collection("logs");

    //handlers
    bot.use(session)
    bot.use(async (ctx, next) => {
        logs.insertOne(ctx.update);
        try {
            if (ctx.update.callback_query) {
                await ctx.answerCbQuery();

                ctx.state.data = JSON.parse(ctx.callbackQuery.data); // moving data
                ctx.callbackQuery.data = ctx.state.data.command; // add command
            }
        } catch (e) {
            console.log(e);
            return;
        }

        await next();
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
            groups_or_users()
        )
        ctx.state.session = ctx.state.data
    })

    bot.action("get_page", async (ctx) => {
        let session = ctx.state.session
        let data = {...session, ...ctx.state.data} 
        let last_element = await accounts.countDocuments( { type: data.type } );

        if (data.element === "last") {
            data.element = last_element - page_size;
        } else if (data.element < 0) {
            data.element = 0;
        }

        if (data.element >= 0 && data.element < last_element && session.element != data.element) {
            let page_accounts = await accounts
                .find( { type: data.type } )
                .sort( { members: -1, _id: 1 } )
                .skip(data.element)
                .limit(page_size)
                .toArray()
            let message = ( await get_messages(page_accounts) ).join('\n');

            await ctx.editMessageText(
                message, {
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true,
                    ...pagination(data.element, page_size),
                }
            )
            ctx.state.session = ctx.state.data
        }
    })

    bot.launch();

    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

module.exports = { start_bot }
