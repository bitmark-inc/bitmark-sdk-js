let bitmarkSDK = require('../index.js');
let axios = require("axios")

let account = bitmarkSDK.Account.fromSeed('5XEECtxro3wPhntfQCrPMv3X3Kft6A8smRiwB4pbTxgyu44QmQUhKsz')

var assetMeta = {
  "issue_number": "1",
  "media_url": "test",
  "author": "john doe"
}

account.issue("/Users/test/text", 'public', 'text', assetMeta, 1)
  .then((data) => {
    console.log(data)
  }).catch((err) => {
    console.log(err)
  })
