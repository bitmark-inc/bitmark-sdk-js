const bitmarkSDK = require('../index.js');
const Account = bitmarkSDK.Account;

let account = Account.fromSeed("5XEECtoyYxvLXC4B4kp5S2nm8xxw37Z4J5iGx17Qu8YaX1g9G23pLoA")
account.downloadAsset('4d4ac977168387238356db0d797d2e122e99acfd0917015df3c6eed52ce5d6dc') // text
// account.downloadAsset('2c1828fa3718652a9a32861a56ea0dd0bd777e0add6027cbb793f880d8af3094') // jpeg image
  .then(function(data){
    console.log(data) // a buffer
    console.log(data.toString())
  })
  .catch(function(err) {
    console.log(err)
  })
