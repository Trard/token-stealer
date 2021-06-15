const asyncRedis = require("async-redis");
const { parse_to_pair, parse_nums } = require("./parser");

const client = asyncRedis.createClient();

client.on("error", function (err) {
    console.log("Error " + err);
});

const session = async (ctx, next) => {
    let message_id = ctx.update.callback_query
        ? ctx.update.callback_query.message.message_id
        : ctx.update.message.message_id

    let data = await client.hgetall(message_id)

    //read
    if (data != null) {
        ctx.state.session = parse_nums(data)
    } else {
        ctx.state.session = {}
    }

    //process
    await next();

    //write
    if (Object.keys(ctx.state.session).length !== 0) {
        await client.del(message_id)
        await client.hmset(
            message_id,
            ...parse_to_pair(ctx.state.session)
        )
    } else {
        
    }
}

module.exports = { session }
