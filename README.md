# bitmark-sdk

[![Build Status](https://travis-ci.org/bitmark-inc/bitmark-sdk.svg?branch=master)](https://travis-ci.org/bitmark-inc/bitmark-sdk)
[![Coverage Status](https://coveralls.io/repos/bitmark-inc/bitmark-sdk/badge.svg?branch=master)](https://coveralls.io/r/bitmark-inc/bitmark-sdk?branch=master)

# Install

```sh
$ npm install bitmark-sdk
```

# Set up

```javascript
var bitmarkSDK = require('bitmark-sdk');
```

# Quick start

## How to create and restore an account?

### create a new account

```javascript
var Account = bitmarkSDK.Account;

var account = new Account('testnet');
```

The account number designates ownership by serving as the account value
in Bitmark blockchain records.

```javascript
var accountNumber = account.getAccountNumber().toString();
```

### restore an account
There are two different ways to restore an account:
- from a seed (base58 encoded string):

  should be stored in a secure way by application developers, and then can be used to reconstruct the account in order to issue or transfer bitmarks for their users
- from a recovery phrase (24 English words):

  should be sent to each application user so that they can back up their own accounts and properties.

```javascript
var restoredAccount = Account.fromSeed(account.getSeed())

var restoredAccount = Account.fromRecoveryPhrase(account.getRecoveryPhrase());
```

## How to issue bitmarks?

To issue bitmarks on an asset, first you have to decide the accessibility of the asset. The accessibility is set to either `public` or `private`. The following table describes the differences.

| accessibility | public    | private                                  |
|---------------|-----------|------------------------------------------|
| encryption    | NO        | YES                                      |
| access right  | every one | the issuer and the current bitmark owner |

Currently, `private` is not supported yet.

```javascript
var filePath = "example.txt" // the file path to the asset
var accessibility = "public"
var propertyName = "bitmark js sdk demo" // the name of the asset to be registered on the blockchain
var propertyMetadata = {"author": "Bitmark Inc. developers"} // the metadata of the asset to be registered on the blockchain
var quantity = 1 // the amount of bitmarks to be issued
account.issue(filePath, accessibility, propertyName, propertyMetadata, quantity)
  .then(function(result) {
    console.log("Bitmark IDs:");
    for (var i in result) {
      console.log(result[i].txId);
    }
  })
  .catch(function(error) {
    console.log(error)
  });
```

After bitmarks are successfully issued, you'll get an array of bitmark IDs.
To get detailed information of bitmarks, please refer to [Bitmark Query API](http://docs.bitmarkcoreapi.apiary.io/#reference/queries).

## How to transfer a bitmark?

```javascript
var bitmarkId = "85148d5535708a4f345d70772ba25432464c91b9e71844fe167168cfbaf1526a"
var receiverAccountNumber = "e1pFRPqPhY2gpgJTpCiwXDnVeouY9EjHY6STtKwdN6Z4bp4sog"
account.transfer(bitmarkId, receiverAccountNumber)
  .then(function(result) {
    var txId = result;
    console.log("Transaction ID: ", txId)
  })
  .catch(function(error) {
    console.log(error)
  });
```

After the bitmark is successfully transferred, you'll get an ID of this transaction.

## Download your assets

You can download your assets by its bitmark IDs.

```javascript
var bitmarkId = '4d4ac977168387238356db0d797d2e122e99acfd0917015df3c6eed52ce5d6dc'
account.downloadAsset(bitmarkId) // plain/text
  .then(function(data){
    console.log(data) // <Buffer: ....>
    console.log(data.toString()) // Get the text content
  })
  .catch(function(err) {
    console.log(err)
  })
```

## List all bitmarks under the account

```javascript
account.getBitmarks()
  .then(function(result) {
    for (var i in result.bitmarks) {
      console.log("bitmarks under this account:");
      console.log(result.bitmarks[i].id);
    }
  })
  .catch(function(error) {
    console.log(error);
  });
```

# Usage

## Account

#### Set up

```javascript
var Account = bitmarkSDK.Account;
```

Account is where everything starts for an entity which wants to use bitmark services.
An account is used to:
1. register asset to the system
2. issue bitmark
3. encrypt the asset in case of private property
4. transfer bitmark

To create a new random account:

```javascript
var account = new Account();
```

There are 2 optional parameters for the Account constructor: *network* and *version*. The default for *network* is `livenet`, and the only supported version now is 1.

```javascript
var account = new Account('testnet');
var account = new Account('testnet', 1);
```

Losing the account means losing the control over bitmarks and assets of the entity.
Thus, an account should be backed up by saving its string format in a secure place, and be imported when there are operations which require authentication or encryption.

```javascript
var backupString = account.getBackupString(); // using toBase58 is equivalent
var restore = Account.fromBackupString(backupString);
var isValidBackupString = Account.isValidBackupString(backupString); // check whether a string is in valid format
```
### Methods
* *getBackupString()* - export the account as a string
* *getAuthKey()* - return the auth key instance, see AuthKey section for more detail
* *getAccountNumber()* - return the account number instance, see AccountNumber section for more detail
* *getNetwork()* — returns the network of the seed, either `livenet` or `testnet`
* *getVersion()* — returns the version of the seed
* *issue()* - issue bitmarks, see issue API section for more detail
* *transfer()* - transfer a bitmark, see transfer API section for more detail

## Auth Key

#### Set up

```javascript
var AuthKey = bitmarkSDK.AuthKey;
```

#### Instantiate

To get the auth key from an account:
```javascript
var account = new Account();
var authKey = account.getAuthKey();
```

To parse the private key from the KIF (Key Imported Format) string:

```javascript
var authKey = AuthKey.fromKIF('cELQPQoW2YDWBq37V6ZLnEiHDD46BG3tEvVmj6BpiCSvQwSszC');
```

#### Methods
* *toBuffer()* — returns a Buffer object containing the private key
* *toString()* — returns *toBuffer()* in hexadecimal format
* *toKIF()* — returns the private key in KIF.
* *getNetwork()* — returns either `livenet` or `testnet`, depending on the key
* *getType()* — returns the key type (currently only `ed25519`)
* *getAccountNumber()* — returns an AccountNumber object (see the next section)

---

## AccountNumber

#### Set up

```javascript
var AccountNumber = bitmarkSDK.AccountNumber;
```

#### Instantiate

To instantiate an AccountNumber object from an Account:

```javascript
var account = new Account();
var accountNumber = account.getAccountNumber()
```

To instantiate an AccountNumber object from an account number string:

```javascript
var accountNumber = new AccountNumber('bxnT1iqAWFWM2MpSNGMHTq92Y27n81B3ep4vFcTpra4AEU9q7d');
var sameAccountNumber = AccountNumber.fromString('bxnT1iqAWFWM2MpSNGMHTq92Y27n81B3ep4vFcTpra4AEU9q7d');
```

To instantiate an AccountNumber object from a Buffer object:

```javascript
var buffer = new Buffer('73346e71883a09c0421e5d6caa473239c4438af71953295ad903fea410cabb44', 'hex');
var accountNumber = new AccountNumber(buffer, 'testnet', 'ed25519');
var sameAccountNumber01 = AccountNumber.fromBuffer(buffer, 'testnet', 'ed25519');
var sameAccountNumber02 = AccountNumber.froMBuffer('73346e71883a09c0421e5d6caa473239c4438af71953295ad903fea410cabb44', 'testnet', 'ed25519');
```

Note:
* `network` and `keytype` are optional, the defaults are `livenet` and `ed25519`.
* When instantiating a AccountNumber from a Buffer object using the constructor function, input the Buffer object instead of a hexadecimal string value.

#### Validation

```javascript
AccountNumber.isValid('erxs7Li15xcioSpGLi1kPhA4vNvJSJYEUnTzU4oJ989coEuUv;'); // returns false because of bad account number string
AccountNumber.isValid('ayUWeSeJEcATAHQTBU1qkVcEh9V12cnfCeFWAh1Jq7NdVMjH5q', 'testnet'); // returns false because of wrong network
AccountNumber.isValid('erxs7Li15xcioSpGLi1kPhA4vNvJSJYEUnTzU4oJ989coEuUvb', 'testnet'); // returns true
```

#### Methods

* *toString()* — returns the account number as a string
* *getNetwork()* — returns either `livenet` or `testnet`, depending on the account number
* *getPublicKey()* — returns the public key as a hexadecimal string value
* *getKeyType()* — returns the key type (currently only `ed25519`)

---

## Records

### Asset Record

#### Set up

```javascript
var Asset = bitmarkSDK.Asset
```

#### Instantiate

To instantiate an Asset record object:

```javascript
var asset = new Asset()
      .setName('Asset name')
      .addMetadata('description', 'this is asset description')
      .setFingerprint('73346e71883a09c0421e5d6caa473239c4438af71953295ad903fea410cabb44')
      .sign(authKey);
```

#### Methods
* *isSigned()* — returns `true` if the asset record is signed
* *getName()* — returns the string value for an Asset's *Name* property
* *setMetadata(jsonMetadata)* - set the metadata for the asset
* *importMetadata(stringMetadata)* - set the metadata in string format
* *addMetadata(key, value)* - add the metadata to existing metadata set of the asset
* *removeMetadata(key)* - remove a specific metadata from existing metadata set
* *getMetadata()* - get the json metadata
* *getFingerprint()* — returns the hexadecimal value for an Asset's *Fingerprint* property
* *getRegistrant()* — returns an AccountNumber object specifying the Asset's *Registrant* property
* *getSignature()* — returns the Asset object's signature buffer
* *getId()* — returns the Asset object's 'AssetIndex' as a string value
* *toJSON()* — returns the Asset object in JSON format


### Issue Record

#### Set up

```javascript
var Issue = bitmarkSDK.Issue
```

#### Instantiate

To instantiate an Issue record object:

```javascript
var issue = new Issue()
      .fromAsset(asset)
      .setNonce(1)
      .sign(authKey);
```

Note: `fromAsset()` can receive either an Asset object or an *asset-id* string.

#### Methods
* *isSigned()* — returns `true` if the issue record is signed
* *getOwner()* — returnss an AccountNumber object specifying the Issue record's *Owner* property
* *getSignature()* — returns the Issue object's signature buffer
* *getAsset()*: returns the Issue record's corresponding *AssetIndex* as a string value
* *getId()* — returns a hexadecimal string id for the Issue record
* *toJSON()* — returns the Issue object in JSON format

---

### Transfer

#### Set up

```javascript
var Transfer = bitmarkSDK.Transfer
```

#### Instantiate


To instantiate a Transfer record object:

```javascript
var transfer = new Transfer()
      .fromTx(previousTransfer)
      .toAccountNumber(newOwner)
      .sign(authKey);
```

Note: `fromTx()` can receive either an Issue or Transfer instance *or* an id string from either an Issue or Transfer instance.

#### Methods
* *isSigned()* — returns `true` if the transfer record is signed
* *getOwner()* —  returns an AccountNumber object specifying the the Transfer record's *Owner* property
* *getSignature()*: returns the Transfer object's signature buffer
* *getPreTxId()*: returns a hexadecimal string of the *Id* for the previous record in the chain-of ownership (either an Issue record or Transfer record) — the same as a record's *Link* property in the blockchain data structure
* *getId()* — returns a hexadecimal string id for the Transfer record
* *toJSON()* — returns the Transfer object in JSON format
---

## API

```javascript
var API = require('bitmark-sdk').API
```

### Issue

#### Usage

```javascript
let account = new Account('testnet');
let filepath = '/path/to/my/file';
let asset = null;
let quantity = 10;

// Issue a new asset
util.fingerprint.fromStream(fs.createReadStream(filepath))
  .then(fingerprint => {
    asset = new Asset()
      .setName('My asset')
      .setMetadata({Author: 'me'})
      .setFingerprint(fingerprint)
      .sign(account.getAuthKey());

    return API.issueNew(fs.createReadStream(filepath), asset, quantity, account); // you can use account.issueNew instead
  })
  .then(issues => {
    // process the issues as you wish
  })
  .catch(error => {
    // process the error
  });
```

```javascript
// Later on, when we want to issue more
let quantity = 15;
API.issueMore(asset, quantity, account) // we can use account.issueMore instead
  .then(issues => {
    // process the issues as you wish
  })
  .catch(error => {
    // process the error
  });
```

#### Parameters
For `issueNew(file, asset, quantity, account)`
* *file* a string filepath or FileReaderStream instance
* *asset* Asset instance
* *quantity* an interger between 1 and 100
* *account* the owner of the issues

For `issueMore(asset, quantity, account)`
* *asset* Asset instance of asset id string
* *quantity* an interger between 1 and 100
* *account* the owner of the issues

### Transfer

#### Usage
```javascript
API.transfer(link, toOwner, account)
  .then((transfer) => {
    console.log(`transfer with id ${transfer.getId()} is waiting to be confirmed`);
  })
  .catch((error) => {
    console.log(`Tranfer failed with error: ${error.message}`);
  });
```

Or we can call call it from account instance
```javascript
account.transfer(link, toOwner)
```

#### Parameters
* *link* Issuance/Transfer instance of id string from Issuance/Transfer instance
* *toOwner* can receive AccountNumber instance or AccountNumber in string format
* *account* Account instance

#### Return
The transfer API return a promise instance after the call is finished.
The `then` callback is called with Transfer instance

### Get specific bitmark

#### Usage
```javascript
var id = '6dc2b758d641d3aa4c5033eeaa6639ada4aea231a37f09de3297a58c2152c22';
var network = 'testnet';
var options = {pending: true, asset: true};
API.getBitmark(id, network, options)
  .then(result => {
    // use result as you wish
  });
```

#### Parameter
* *id* id string of the transaction
* *network* network name
* *options* see all the possible option in the API document

### Get collection of bitmarks

#### Usage
```javascript
var network = 'testnet';
var options = {pending: true, asset: true, owner: 'eQc5G8Zi7FfRQckrfzNmc3TjkutQKgzBiSQiQRjorsPBBs8FoF'};
API.getBitmarks(network, options)
  .then(result => {
    // use result as you wish
  });
```

#### Parameter
* *network* network name
* *options* see all the possible option in the API document

### Get specific Asset

#### Usage
```javascript
var id = '7d683640a76bf1f9db3ff654044a37f9b616dbbc10085e635504998a971e0722d1d6b4b967cc09b7a6f912a4be30eb8c4f590f0efddd4ada08d1d6ab566cb140';
var network = 'testnet';
var options = {};
API.getBitmark(id, network, options)
  .then(result => {
    // use result as you wish
  });
```

#### Parameter
* *id* id string of the asset
* *network* network name
* *options* see all the possible option in the API document

### Get specific Asset

#### Usage
```javascript
var id = '7d683640a76bf1f9db3ff654044a37f9b616dbbc10085e635504998a971e0722d1d6b4b967cc09b7a6f912a4be30eb8c4f590f0efddd4ada08d1d6ab566cb140';
var network = 'testnet';
var options = {};
API.getBitmark(id, network, options)
  .then(result => {
    // use result as you wish
  });
```

#### Parameter
* *id* id string of the asset
* *network* network name
* *options* see all the possible option in the API document

## Utilities

### Fingerprint

#### Set up

```javascript
var bitmarkSDK = require('bitmark-sdk');
var fingerprint = bitmarkSDK.util.fingeprint;
```

#### Methods
* *fromBuffer(Buffer)* - returns a fingerprint string from buffer content
* *fromString(string)* - returns a fingerprint string from string content
* *fromStream(ReadStream)* - returns a promise which then callback with the fingerprint

--


# License

Copyright (c) 2014-2017 Bitmark Inc (support@bitmark.com).

Permission to use, copy, modify, and distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
