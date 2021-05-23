const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
    auth: process.env.gittoken
});

function unique(arr) {
    return Array.from(new Set(arr));
}

async function get_searches(search_string) {
    let searches = await octokit.rest.search.code({
        q: search_string,
        sort: "indexed",
        per_page: 100,
    });
    return searches.data.items;
};

async function get_code(owner, repo, file_sha) {
    let code = await octokit.rest.git.getBlob({
        owner,
        repo,
        file_sha,
    });
    let base64 = Buffer.from(code.data.content, 'base64');
    return base64.toString('utf8');
}

async function get_tokens(search_string, regexp) {
    let searches = await get_searches(search_string)
    let promises = searches.map(async function (search) {
        let code = await get_code(
            search.repository.owner.login,
            search.repository.name,
            search.sha
        );
        let match = regexp.exec(code);
        if (match != null) {
            return match[1];
        };
    });

    let tokens = await Promise.all(promises);
    let res = unique(tokens.filter(n => n))
    return res;
}

module.exports = { get_tokens };