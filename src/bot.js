const { VK, Keyboard } = require('vk-io');
const { HearManager } = require('@vk-io/hear');
const MongoClient = require("mongodb").MongoClient;
const { db_get_collection, db_add, db_available_value, db_delete_value } = require("./updater.js")
const { get_vk_messages } = require('./handler.js')

const client = new MongoClient(
    process.env.MONGO_STEALER_LINK,
    { useUnifiedTopology: true },
);

const vk = new VK({
    token: process.env.VK_STEALER_BOT_TOKEN
});
const hearManager = new HearManager();

await client.connect();

const db = client.db("stealer");
const accounts = db.collection("accounts");

setInterval(db_administration(db, accounts), 1000 * 60 * 30); //30 мин

client.connect(async function(err, client) {

    const db = client.db("stealer")
    const users = db.collection("users");
    const groups = db.collection("groups");
    const logs = db.collection("logs")
    
    vk.updates.on('message_new', (context, next) => {
        const { messagePayload } = context;
        
        let log = JSON.parse(JSON.stringify(context)) //mega poop
        log.expireAfterSeconds = 60 * 60 * 24 * 30 //30 days

        db_add(logs, log)

        if (messagePayload && messagePayload.command && messagePayload.arg) {
            context.state.command = messagePayload.command
            context.state.arg = messagePayload.arg
        } else if (context.text) {
            context.state.command = context.text.split(' ')[0]
            context.state.arg = context.text.split(' ')[1]
        } else {
            context.state.command = "undefined command"
        }
        
        return next();
    });

    vk.updates.on('message_new', hearManager.middleware);

    const hearCommand = (name, handle) => {
        hearManager.hear(
            [
                (text, { state }) => (
                    state.command.match(name)
                ),
                name
            ],
            handle
        );
    };
    
    hearCommand(/гитхаб/i, async (context) => {
    
        let current_offset = context.messagePayload && context.messagePayload.offset
        ? context.messagePayload.offset
        : 0

        let collection_type;
        let sort;
        let page = context.state.arg
        ? context.state.arg
        : undefined

        switch (page) {
            case "группы":
                collection_type = groups;
                sort = {
                    members: -1,
                    _id: 1
                }
                break
            case "юзеры":
                collection_type = users
                sort = {}
                break
            default:
                context.send("Невалидное значение аргумента")
                throw new Error("Invalid arg");
        }

        let checks = await db_get_collection(collection_type, sort, current_offset, 3);

        if (checks !== undefined && Object.keys(checks).length > 0) {
            let message_text = await get_vk_messages(checks)
            context.send({
                message: message_text.join("\n"),
                keyboard: Keyboard.builder()
                    .textButton({
                    label: '⬅',
                        payload: {
                            command: `гитхаб`,
                            arg: page,
                            offset: current_offset-3
                        }
                    })
                    .textButton({
                        label: '➡',
                        payload: {
                            command: `гитхаб`,
                            arg: page,
                            offset: current_offset+3
                        }
                    })
                    .row()
                    .inline()
            })
        } else {
            context.send({
                message: "Нет данных"
            })
        }
    });

    hearCommand(/undefined command/, (context) => {
        if (context.peerId < 2000000000) {
            context.send(message = "Не понял Вас")
        }
    })

    vk.updates.start().catch(console.error);
});