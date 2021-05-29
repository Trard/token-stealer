async function get_messages(checks) {
    let promises = checks.map(async function (check) {
        let final_string;
        switch (check.type) {
            case "user":
                final_string =
`[${check.account.first_name} ${check.account.last_name}](vk.com/id${check.account.id}) - ${check.account.is_closed === 0 ? "открытая" : "закрытая"} страница
Токен: \`\`\`${check.token}\`\`\`
`
                break;
            case "group":
                let perms = await check.perms.permissions.map(perm => perm.name).join(", ")
                final_string =
`[${check.account.name}](vk.com/club${check.account.id}) - ${check.account.is_closed === 0 ? "открытая" : "закрытая"} группа
Участников: ${check.members}
Доступ к: ${perms}
Токен: \`\`\`${check.token}\`\`\`
`

                break;
            }
            return final_string;
        })
        return Promise.all(promises);
}

module.exports = { get_messages }