const { Telegraf, Markup } = require('telegraf');
const asyncRedis = require("async-redis");

const { session } = require('../../lib/message_session');
const { pagination, groups_or_users } = require('./keyboards.js');

const start_bot = (logs, page_size) => {
    //init
    const bot = new Telegraf(process.env.STEALER_TELEGRAM_TOKEN);
    const client = asyncRedis.createClient();

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
        };

        await next();
    });

    bot.start((ctx) => {
        ctx.reply('Hello!', Markup
            .keyboard(['/github'])
            .resize()
        );
    });

    bot.command('github', (ctx) => {
        ctx.reply(
            'Choose users or groups',
            groups_or_users()
        );
    });

    bot.action('stop', async (ctx) => {
        await ctx.editMessageText(
            'Choose users or groups',
            groups_or_users()
        );
        ctx.state.session = ctx.state.data;
    });

    bot.action("get_page", async (ctx) => {
        let session = ctx.state.session;
        let data = {...session, ...ctx.state.data};
        let last_element = await client.llen(data.type)

        //handlers
        if (data.element === "last" || data.element > last_element) {
            data.element = last_element - page_size - 1;
        }
        if (data.element < 0) {
            data.element = 0;
        }

        if (data.element >= 0 && data.element < last_element && session.element != data.element) {
            let message = (
                await client.lrange(
                    data.type,
                    data.element,
                    data.element+page_size,
                )
            ).join('\n');

            await ctx.editMessageText(
                message, {
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true,
                    ...pagination(data.element, page_size),
                }
            );
        }
        ctx.state.session = data;
    });

    bot.launch();

    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
};

module.exports = { start_bot };
