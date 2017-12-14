let networks = require('./networks.js');
let _ = require('lodash');
let assert = require('./util/assert.js');
let nacl = require('tweetnacl-nodewrap');

let Seed = require('./seed');
let RecoveryPhrase = require('./recovery-phrase');
let AuthKey = require('./auth-key');
let API = require('./api');
let config = require('./config');
let util = require('./util');
let BigInteger = require('bn.js');

function standardizeNetwork(network) {
  network = network || networks.livenet;
  if (_.isString(network)) {
    network = networks[network];
    assert(network, new TypeError('Seed error: can not recognize network'));
  }
  return network;
}

function AccountInfo(values) {
  this.getValues = () => { return values; }
}

let Account = function(network, version) {
  if (!(this instanceof Account)) {
    return new Account(network, version);
  }

  if (network instanceof AccountInfo) {
    Object.assign(this, network.getValues());
    return;
  }

  try {
    this._core = util.common.generateRandomBytes(config.core.length);
    this._network = standardizeNetwork(network).name;
  } catch (error) {
    throw error;
  }
}

Account.prototype.generateKey = function(index) {
  let counter = new BigInteger(index.toString());
  let counterBuffer = counter.toBuffer('be', config.core.counter_length);
  let nonce = Buffer.alloc(config.core.nonce_length, 0);
  let key = nacl.secretbox(counterBuffer, nonce, this._core);
  return key;
}

Account.prototype.getAuthKey = function() {
  if (!this._authKey) {
    this._authKey = AuthKey.fromBuffer(this.generateKey(config.key.auth_key_index), this._network);
  }
  return this._authKey;
}

Account.prototype.getAccountNumber = function() {
  return this.getAuthKey().getAccountNumber().toString();
}

Account.prototype.getNetwork = function() {
  return this._network;
}

// FOR BACKING UP THE ACCOUNT

Account.fromSeed = function(seedString) {
  let seed = Seed.fromString(seedString);
  let accountInfo = new AccountInfo({_core: seed.getCore(), _network: seed.getNetwork()});
  return new Account(accountInfo);
};

Account.isValidSeed = function(backupString) {
  return Seed.isValid(backupString);
}

Account.fromRecoveryPhrase = function(recoveryPhraseString) {
  let recoveryPhrase = RecoveryPhrase.fromString(recoveryPhraseString);
  let accountInfo = new AccountInfo({_core: recoveryPhrase.getCore(), _network: recoveryPhrase.getNetwork()});
  return new Account(accountInfo);
}

Account.isValidRecoveryPhrase = function(recoveryPhraseString) {
  return RecoveryPhrase.isValid(recoveryPhraseString);
}

Account.prototype.getSeed = function() {
  let seed = Seed.fromCore(this._core, this._network);
  return seed.toString();
}

Account.prototype.getRecoveryPhrase = function() {
  let recoveryPhrase = RecoveryPhrase.fromCore(this._core, this._network);
  return recoveryPhrase.toString();
}

// FOR API

Account.prototype.issue = function(asset, quantity, retryTimes) {
  return API.issue(asset, quantity, retryTimes, this);
}

// Account.prototype.issueNew = function() {
//   let args = Array.prototype.slice.call(arguments);
//   args.push(this);
//   return API.issueNew.apply(API, args);
// }

// Account.prototype.issueMore = function() {
//   let args = Array.prototype.slice.call(arguments);
//   args.push(this);
//   return API.issueMore.apply(API, args);
// }

Account.prototype.transfer = function() {
  let args = Array.prototype.slice.call(arguments);
  args.push(this);
  return API.transfer.apply(API, args);
}

Account.prototype.downloadAsset = function(bitmarkId) {
  return API.downloadBitmarkAsset(bitmarkId, this._network);
}

Account.prototype.getBitmarks = function(options) {
  options = options || {};
  options.owner = this.getAccountNumber().toString();
  return API.getBitmarks(options, this._network);
}

module.exports = Account;
