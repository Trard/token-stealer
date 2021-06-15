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

    //await rPush("groups", message_group)
    //await rPush("users", message_user)
    
    client.lrange("groups", 0, -1, (err, items) => {
        console.log(items)
    })
    
}

module.exports = { cache };