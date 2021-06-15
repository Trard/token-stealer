const redis = require("redis");

const cache = (db) => {
    const accounts = db.collection("accounts");
    let page_accounts = await accounts
        .find( { type: data.type } )
        .sort( { members_count: -1, _id: 1 } )
        .toArray()
}

module.exports = { cache };