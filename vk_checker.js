const { VK } = require("vk-io");

const vk = new VK({});

async function vk_checker_user(vktoken) {
    let base = vk.api.users.get({
        access_token: vktoken,
        fields: "photo_200"
    });
    return base;
};

async function get_members(vktoken, id) {
    let members = vk.api.groups.getMembers({
        access_token: vktoken,
        group_id: id
    })
    return members;
}

async function vk_checker_group(vktoken) {
    let base = vk.api.groups.getById({
        access_token: vktoken
    })

    let perms = vk.api.groups.getTokenPermissions({
        access_token: vktoken
    });
    
    let info = Promise.all([base, perms]);
    return info;
};

async function vk_checker(tokens) {
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
                let group_members = await get_members(token, account[0][0].id)
                let result = {
                    account: account[0][0],
                    perms: account[1],
                    members: group_members.count
                }
                result.token = token;
                result.type = "group";
                return result;
            };
        } catch {};
    });
    let result = await Promise.all(promises);
    return result.filter(n => n);
};

module.exports = { vk_checker };