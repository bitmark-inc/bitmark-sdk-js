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

let lib = require('bitmark-lib');
let Seed = lib.Seed;
let AuthKey = lib.AuthKey;
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
    this.seed = new Seed(network, version);
    this.authKey = AuthKey.fromSeed(this.seed);
  } catch (error) {
    throw error;
  }
}

Account.prototype.getBackupString = function() {
  return this.seed.toString();
}

Account.prototype.getAuthKey = function() {
  return this.authKey;
}

Account.prototype.issue = function() {
  let args = Array.prototype.slice.call(arguments);
  args.push(this);
  return API.issue.apply(API, args);
}

module.exports = Account;
