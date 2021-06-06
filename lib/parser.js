const parse_to_pair = (object) => {
    return Object.entries(object).flat()
}

const parse_nums = (object) => {
    let entries = Object.entries(object)
    let parsed_entries = entries.map((entrie) => {
        let value = entrie[1]
        let key = entrie[0]
        if ( !isNaN(value) ) {
            return [key, parseInt(value, 10)]
        } else {
            return entrie
        }
    })
    let res = Object.fromEntries(parsed_entries)
    return res
}

module.exports = { parse_to_pair, parse_nums }