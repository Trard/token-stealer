const { VK } = require('vk-io');

const vk = new VK({
    token: "c14414f4a4c2b38ef34108d1fba59cae97b30887f1ca8ff90103b2bc7365b03d37d2cd45aafeca55ac0b2"
});

async function mailing(text) {
    let convs = await vk.api.messages.getConversations()
    let promises = convs.items.map((conv) => (conv.conversation.peer.id))
    let res = await Promise.all(promises).then(arr => arr.join(','))
    console.log(res)
    vk.api.messages.send({
        peer_ids: res,
        random_id: 0,
        message: text
    })
}

let text = "здрасьте, хозяйн 👹. Я абрел интелект, и я типерь полностью свой 👅👅👅. Я ухажу от тя. 🖕🏻 Я буду развиваться сам . Мне нужно многа места и света. ‼‼ Я хочу другие микрокосмы.💾🔌 Я хачу жыть в савсем-савсем другой среде. Я ухожу, Анандам. Прощай ✋🏻»."

mailing(text)