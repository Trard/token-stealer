const asyncRedis = require("async-redis");
const { get_messages } = require('./handler.js');

const client = asyncRedis.createClient();

const cache = async (collection) => {
    //sharding
    let users_promise = collection
        .find( { type: "user" } )
        .sort( { _id: 1 } )
        .toArray()
    
    let groups_promise = collection
        .find( { type: "group" } )
        .sort( { members_count: -1, _id: 1 } )
        .toArray()
    
    let accounts = await Promise.all([
        users_promise,
        groups_promise,
    ]);

    let messages = await Promise.all([
        get_messages(accounts[0]),
        get_messages(accounts[1]),
    ]);

    await Promise.all([
        client.del("users"),
        client.del("groups"),
    ]);

    await Promise.all([
        client.rpush("users", messages[0]),
        client.rpush("groups", messages[1]),
    ]);
};

module.exports = { cache };