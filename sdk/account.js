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

var lib = require('bitmark-lib');
var Seed = lib.Seed;
var AuthKey = lib.AuthKey;

function AccountInfo(values) {
  this.getValues = function() { return values; }
}

var Account = function(network, version) {
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

module.exports = Account;
