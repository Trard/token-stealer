const { cache } = require('../src/bot/cacher');

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

    cache(accounts)
}

main()