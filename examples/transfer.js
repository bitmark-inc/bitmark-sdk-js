let bitmarkSDK = require("../index.js")
let axios = require("axios")

const apiServer = "https://api.devel.bitmark.com"

let mySeed = new bitmarkSDK.Seed.fromBase58('5XEECtxro3wPhntfQCrPMv3X3Kft6A8smRiwB4pbTxgyu44QmQUhKsz')
let authKey = bitmarkSDK.AuthKey.fromSeed(mySeed);

if (process.argv.length < 3) {
  return
}

// Generate a transfer
let transfer = new bitmarkSDK.Transfer()
transfer
  .fromTx(process.argv[2])
  .toAccountNumber("fqN6WnjUaekfrqBvvmsjVskoqXnhJ632xJPHzdSgReC6bhZGuP")
  .sign(authKey)
console.log(JSON.stringify(transfer, null, 2))

// The request data
let data = {transfer: transfer}
console.log(JSON.stringify(data, null, 2))

axios
  .post(apiServer + '/v1/transfer', data)
  .then((resp) => {
    console.log(resp.data)
  })
  .catch((err) => {
    console.log(err.response.data)
  })
