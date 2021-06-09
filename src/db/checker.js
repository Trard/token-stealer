const fetch = require('node-fetch');

const get_params = (body) => {
    let data = [];
    let entries = Object.entries(body);

    entries.map((entrie) => {
        data.push(`${entrie[0]}=${entrie[1]}`);
    })

    let params = {
        "headers": {
            "content-type": "application/x-www-form-urlencoded",
        },
        "body": data.join("&"),
        "method": "POST",
    };

    return params;
}

const get_account = async (token) => {
    let account = {
        token
    };

    let user_base = await fetch(
        "https://api.vk.com/method/users.get",
        get_params({
            access_token: token,
            v: "5.131"
        })
    )
    .then(res => res.json());

    if (user_base.error) {
        account.type = "invalid";
    } else if (user_base.response.length !== 0) {
        account.type = "user";
        account.base = user_base.response[0];
    } else {
        let group_base = await fetch(
            "https://api.vk.com/method/groups.getById",
            get_params({
                access_token: token,
                v: "5.131"
            })
        )
        .then(res => res.json());

        if (group_base.error) {
            account.type = "invalid"; //0.00...001 chance that the token has already been deactivated during this time
        } else if (group_base.response.length !== 0) {
            account.type = "group";
            account.base = group_base.response[0];
        } else {
            account.type = "service";
        };
    };
    
    return account;
}

const get_checks = async (tokens) => {
    let result = await Promise.all(
        tokens.map(async function (token) {
            let check = await get_account(token);
            switch (check.type) {
                case "user": {
                    let perms = await fetch(
                        "https://api.vk.com/method/account.getAppPermissions",
                        get_params({
                            access_token: token,
                            v: "5.131"
                        })
                    )
                    .then(res => res.json());

                    if (perms.error) {
                        check.type = "invalid";
                    } else if (perms.response) {
                        check.perms = perms.response;
                    };

                    break;
                }
                case "group": {
                    let perms = await fetch(
                        "https://api.vk.com/method/groups.getTokenPermissions",
                        get_params({
                            access_token: token,
                            v: "5.131"
                        })
                    )
                    .then(res => res.json());

                    let members = await fetch(
                        "https://api.vk.com/method/groups.getMembers",
                        get_params({
                            access_token: token,
                            v: "5.131",
                            group_id: check.base.id
                        })
                    )
                    .then(res => res.json());

                    if (perms.error || members.error) {
                        check.type = "invalid";
                    } else if (perms.response) {
                        check.perms = perms.response.mask;
                        check.members_count = members.response.count;
                    };

                    break;
                };
            };
            return check;
        })
    );

    return result.filter(n => n);
};

const is_token_valid = async (token) => {
    let status = await fetch(
        "https://api.vk.com/method/users.get",
        get_params(token)
    )
    .then(res => res.json());

    return status.response ? true : false;
};

module.exports = { get_checks, is_token_valid };