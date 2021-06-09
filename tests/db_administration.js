const { db_administration } = require('../src/db/updater');
const MongoClient = require("mongodb").MongoClient;

const client = new MongoClient(
    process.env.STEALER_MONGO_LINK,
    { useUnifiedTopology: true },
);

const main = async () => {
    await client.connect();

    const db = client.db("stealer");
    let accounts = db.collection("accounts1");

    db_administration(accounts)
}

main();