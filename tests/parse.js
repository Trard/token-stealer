const { parse_to_pair, parse_nums } = require("../lib/parser");

console.log(...parse_to_pair({lol: "yes", one: 1}));
console.log(parse_nums({lol: "yes", one: "1"}));