const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

const unique = (arr) => {
    return Array.from(new Set(arr));
};

const get_search_items = async (search_string) => {
    let items = octokit.rest.search.code({
        q: search_string,
        sort: "indexed",
        per_page: 100,
    }).then((searches) => searches.data.items);

    return items;
};

const get_code = async (owner, repo, file_sha) => {
    let code = await octokit.rest.git.getBlob({
        owner,
        repo,
        file_sha,
    });

    let base64 = Buffer.from(code.data.content, 'base64');
    let utf8 = base64.toString('utf8');

    return utf8;
}

const get_tokens = async (search_string, regexp) => {
    let items = await get_search_items(search_string);

    let tokens = await Promise.all(
        items.map(async function (search) {
            let code = await get_code(
                search.repository.owner.login,
                search.repository.name,
                search.sha
            );

            let match = regexp.exec(code);
            if (match != null) {
                return match[1];
            };
        })
    );
    
    let result = unique(tokens.filter(n => n));
    return result;
}

module.exports = { get_tokens };