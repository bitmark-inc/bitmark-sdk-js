const fs = require('fs');

let createFileWithRandomContent = (filePath) => {
  let prefix = 'File with random content for the sample \n';
  let content = '';
  let possibleText = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomLength = 100 + Math.floor(Math.random() * 1000);
  for (var i = 0; i < randomLength; i++) {
    content += possibleText.charAt(Math.floor(Math.random() * possibleText.length));
  }
  fs.writeFileSync(filePath, prefix + content);
}

let log = (text, value, color) => {
  if (color) {
    console.log(color, text);
  } else {
    console.log(text);
  }
  if (value) {
    console.log(`=> ${value}`);
  }
  console.log('');
}


(async function() {

  log('PART 1 - CREATING ACCOUNT AND BACKUP', null, '\x1b[33m%s\x1b[0m')
  let bitmarkSDK = require('./index');
  let account = new bitmarkSDK.Account('testnet');

  let backupSeed = account.getSeed();
  log('- Backup seed', backupSeed);

  let recoveryPhrase = account.getRecoveryPhrase();
  log('- Recovery phrase', recoveryPhrase);

  let accountNumber = account.getAccountNumber();
  log('- Account number', accountNumber.toString());



  log('PART 2 - LOAD ACCOUNT FROM BACKUP AND ISSUE NEW ASSET', null, '\x1b[33m%s\x1b[0m');
  account = bitmarkSDK.Account.fromRecoveryPhrase(recoveryPhrase);
  log('Account info', `Account number: ${account.getAccountNumber().toString()} - network: ${account.getNetwork()}`);

  let filePath = './tmp.txt';
  createFileWithRandomContent(filePath);
  log('File with random content created at ', filePath);

  // Create the asset object
  let asset = new bitmarkSDK.Asset()
    .setName('My test asset')
    .setMetadata({
      author: 'Bitmark developer'
    });
  
  // Load the file into the object
  await asset.loadFile(filePath, 'public');

  // Issue on the blockchain
  let data = await account.issue(asset, 2);
  log('Issue record on the blockchain', JSON.stringify(data, null, 2));
})();
