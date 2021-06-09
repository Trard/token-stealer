const { get_checks, is_token_valid } = require("../src/db/checker");

const test_tokens = [
    '72ebbd071624448cf812128336bce2a79eb6d030d47683496f212a8055a239819c169bdfec82748dfddad',
    '12dacc088614b0c0788236bd653a56b532b782d741a12d99a626feaa58264980c5785739c5ca16c215b2a',
    '71422acb612bfd91f6f2b3b12b63024d8772614a4a112ac23644853241b3b72350506ec2c47510193e785',
    'b6f04af9d23ebfa32f23a3f70a3ebf5c0f09b07adff8519904ee7d434a0ece561d3005b08c5b60fc493e1',
    'f2db190e74d543b75f710f9e33fb5986d92f1b3988d4e64747a3b2ff28396d2fafe9124de597d76b5e37b'
]

const main = async () => {
    //let checks = await get_checks(test_tokens);
    //console.log(checks)
    console.log(await is_token_valid("b6f04af9d23ebfa32f23a3f70a3ebf5c0f09b07adff8519904ee7d434a0ece561d3005b08c5b60fc493e1"))
}

main()