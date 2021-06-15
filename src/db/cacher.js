const asyncRedis = require("async-redis");
const client = asyncRedis.createClient();

const { get_messages } = require('./handler.js');

client.on("error", function (err) {
    console.log("Error " + err);
});

const cache = async (db) => {
    const accounts = db.collection("accounts");

    let users = await accounts
        .find( { type: "user" } )
        .sort( { _id: 1 } )
        .toArray()
    
    let groups = await accounts
        .find( { type: "group" } )
        .sort( { members_count: -1, _id: 1 } )
        .toArray()
    
    let message_group = await get_messages(groups)
    let message_user = await get_messages(users)

    await client.rpush("groups", message_group)
    await client.rpush("users", message_user)
    
    const a = await client.lrange("groups", 0, -1)
    console.log(a)
}

module.exports = { cache };