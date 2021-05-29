const { db_administration } = require('./db/updater');
const MongoClient = require("mongodb").MongoClient;

const client = new MongoClient(
    process.env.STEALER_MONGO_LINK,
    { useUnifiedTopology: true },
);

const main = async () => {
    await client.connect();

    const db = client.db("stealer");
    let accounts = db.collection("accounts");

    setInterval(
        () => {
            db_administration(accounts)
        },
        1000 * 60 * 30 //30 min
    );
}

main()