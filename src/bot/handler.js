async function get_messages(checks) {
    let promises = checks.map(async function (check) {
        let final_string;
        switch (check.type) {
            case "user":
                final_string =
`[${check.account.first_name} ${check.account.last_name}](vk.com/id${check.account.id}) - ${check.account.is_closed === 0 ? "opened" : "closed"} user
Token: \`\`\`${check.token}\`\`\`
`
                break;
            case "group":
                let perms = await check.perms.permissions.map(perm => perm.name).join(", ");
                final_string =
`[${check.account.name}](vk.com/club${check.account.id}) - ${check.account.is_closed === 0 ? "opened" : "closed"} group
Members count: ${check.members}
Access to: ${perms}
Token: \`\`\`${check.token}\`\`\`
`

                break;
            }
            return final_string;
        })
        return Promise.all(promises);
}

module.exports = { get_messages };