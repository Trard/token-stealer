const { VK } = require("vk-io");

const vk = new VK({
    token: process.env.vktoken
});

async function get_vk_messages(checks) {
    let promises = checks.map(async function (check) {
        let message_object;
        let final_string;
        let photo;
        switch (check.type) {
            case "user":
                final_string =
`[id${check.account.id}|${check.account.first_name} ${check.account.last_name}] - ${check.account.is_closed === 0 ? "открытая" : "закрытая"} страница
Токен: ${check.token}
`
                photo = await vk.upload.messagePhoto({
                    source: {
                        value: check.account.photo_max_orig
                    }
                }).then((id) => `${id}`);
                
                message_object = {
                    text: final_string,
                    attachment: photo
                }
                break;
            case "group":
                let perms = await check.perms.permissions.map(perm => perm.name).join(", ")
                final_string =
`[club${check.account.id}|${check.account.name}] - ${check.account.is_closed === 0 ? "открытая" : "закрытая"} группа
Доступ к ${perms}
Токен: ${check.token}
`
                photo = await vk.upload.messagePhoto({
                    source: {
                        value: check.account.photo_200
                    }
                }).then((id) => `${id}`); //чтобы строка была

                message_object = {
                    text: final_string,
                    attachment: photo
                }
                break;
            }
            return message_object;
        })
        return Promise.all(promises);
}

module.exports = { get_vk_messages }