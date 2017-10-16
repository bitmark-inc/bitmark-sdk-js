/**
 * new Account();
 * new Account(network);
 * new Account(network, version);
 * 
 * Account.fromBackupString();
 * 
 * account.getBackupString();
 * account.getNetwork();
 * account.getAccountNumber();
 * account.getVersion();
 * 
 * Account.isValidBackupString(backupString);
 */

let Seed = require('./seed');
let AuthKey = require('./auth-key');
let API = require('./api');

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
    this._seed = new Seed(network, version);
    this._authKey = AuthKey.fromSeed(this._seed);
  } catch (error) {
    throw error;
  }
}

Account.fromBackupString = function(backupString) {
  let seed = Seed.fromString(backupString);
  let authKey = AuthKey.fromSeed(seed);
  let accountInfo = new AccountInfo({_seed: seed, _authKey: authKey});
  return new Account(accountInfo);
}

Account.isValidBackupString = function(backupString) {
  return Seed.isValid(backupString);
}

Account.prototype.getBackupString = function() {
  return this._seed.toString();
}

Account.prototype.getAuthKey = function() {
  return this._authKey;
}

Account.prototype.getAccountNumber = function() {
  return this._authKey.getAccountNumber();
}

Account.prototype.getNetwork = function() {
  return this._seed.getNetwork();
}

Account.prototype.getVersion = function() {
  return this._seed.getVersion();
}

Account.prototype.issue = function() {
  let args = Array.prototype.slice.call(arguments);
  args.push(this);
  return API.issue.apply(API, args);
}

Account.prototype.transfer = function() {
  let args = Array.prototype.slice.call(arguments);
  args.push(this);
  return API.transfer.apply(API, args);
}

module.exports = Account;
