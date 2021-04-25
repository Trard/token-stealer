const { VK } = require('vk-io');
const { HearManager } = require('@vk-io/hear');
const { dbgetall, dbgetrandom, dbset, dbdeleteall  } = require('./db.js');
const { get_vk_messages } = require('./vk_handler.js')

const vk = new VK({
    token: process.env.vktoken
});

const hearManager = new HearManager();
const admins = [495643428, 64139266]

vk.updates.on('message_new', hearManager.middleware);

hearManager.hear(/гитхаб все/i, async (context) => {
    if (admins.indexOf(context.senderId) != -1) {
        let messages = await dbgetall();
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
    }
});

hearManager.hear(/гитхаб рандом/i, async (context) => {
    let message = await dbgetrandom().then(arr => arr[0])
    context.send({
        message: message.text,
        attachment: message.attachment
    })
})

async function dbupdate() {
    while (true) {
        let messages = await get_vk_messages()
        await dbdeleteall()
        for (message of messages) {
            dbset(message.text, message.attachment)
        }
        console.log("updated db")
        await new Promise(resolve => setTimeout(resolve, 30 * 60 * 1000)); //спим 30 мин
    }
}

dbupdate()
vk.updates.start().catch(console.error);