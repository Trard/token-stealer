const { client, db_administration } = require("../src/updater.js");

const main = async () => {
    await client.connect()

    const db = client.db("stealer");
    let accounts = db.collection("accounts");

    setInterval(
        () => {
            db_administration(accounts)
        },
        1000 * 60 * 1 //1 min for test
    );
}

main()