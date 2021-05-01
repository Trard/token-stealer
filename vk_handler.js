async function get_vk_messages(checks) {
    let promises = checks.map(async function (check) {
        let final_string;
        switch (check.type) {
            case "user":
                final_string =
`[id${check.account.id}|${check.account.first_name} ${check.account.last_name}] - ${check.account.is_closed === 0 ? "открытая" : "закрытая"} страница
Токен: ${check.token}
`
                break;
            case "group":
                let perms = await check.perms.permissions.map(perm => perm.name).join(", ")
                final_string =
`[club${check.account.id}|${check.account.name}] - ${check.account.is_closed === 0 ? "открытая" : "закрытая"} группа
Участников: ${check.members}
Доступ к: ${perms}
Токен: ${check.token}
`
                break;
            }
            return final_string;
        })
        return Promise.all(promises);
}

module.exports = { get_vk_messages }