const get_user_message = (account) => {
    let perms = account.perms.join(', ');
    let final_string =
`[${account.base.first_name} ${account.base.last_name}](vk.com/id${account.base.id}) - ${account.base.is_closed === 0 ? "opened" : "closed"} user
Access to: ${perms}
Token: \`\`\`${account.token}\`\`\`
`;
    return final_string;
};

const get_group_message = (account) => {
    let perms = account.perms.join(", ");
    let final_string =
`[${account.base.name}](vk.com/club${account.base.id}) - ${account.base.is_closed === 0 ? "opened" : "closed"} group
Members count: ${account.members_count}
Access to: ${perms}
Token: \`\`\`${account.token}\`\`\`
`;
    return final_string;
};

const get_messages = async (accounts) => {
    let messages = accounts.map((account) => {
        let final_string;
        switch (account.type) {
            case "user":
                final_string = get_user_message(account);
                break;
            case "group":
                final_string = get_group_message(account);
                break;
        }
        return final_string;
    });
    return Promise.all(messages);
}

module.exports = { get_messages };