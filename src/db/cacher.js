const { promisify } = require("util");
const redis = require("redis");

const { get_messages } = require('./handler.js');

const client = redis.createClient();

//redis promises
const rPush = promisify(client.rpush).bind(client);

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

    //await rPush("groups", message_group)
    client.lrange("groups", 0, -1, (err, items) => {
        console.log(items)
    })
    
}

module.exports = { cache };