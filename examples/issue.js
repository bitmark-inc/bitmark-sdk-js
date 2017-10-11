let bitmarkSDK = require('../index.js');
let axios = require("axios")

const apiServer = "https://api.devel.bitmark.com"

let mySeed = new bitmarkSDK.Seed.fromBase58('5XEECtxro3wPhntfQCrPMv3X3Kft6A8smRiwB4pbTxgyu44QmQUhKsz')
let authKey = bitmarkSDK.AuthKey.fromSeed(mySeed);


let myData = Date()
console.log("My data is:", myData)
let fingerprint = bitmarkSDK.util.fingerprint.fromString(myData)
console.log("Fingerprint:", fingerprint)

// Generate an asset
let asset = new bitmarkSDK.Asset()
asset
  .setName("my asset")
  .setMetadata({"jim": "test"})
  .setFingerprint(fingerprint)
  .sign(authKey)

// Generate an issue
let issue = new bitmarkSDK.Issue()
issue
  .fromAsset(asset)
  .sign(authKey)

// The request data
let data = {
  assets: [asset],
  issues: [issue]
}
console.log(JSON.stringify(data, null, 2))

axios
  .post(apiServer + '/v1/issue', data)
  .then((resp) => {
    console.log(resp.data)
  })
  .catch((err) => {
    console.log(err.response.data)
  })
