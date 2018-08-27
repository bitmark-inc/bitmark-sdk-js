'use strict';
const _ = require('lodash');
const BigInteger = require('bn.js');
const nacl = require('tweetnacl-nodewrap');

const BITMARK_CONFIG = require('../config/bitmark-config');

const util = require('../util');
const assert = require('../util/assert.js');
const Seed = require('./account/seed');
const RecoveryPhrase = require('./account/recovery-phrase');
const AccountKey = require('./account/account-key');

let Account = function (network, core) {
    util.common.makeSureSDKInitialized();
    let sdkConfig = global.getSDKConfig();
    if (network) assert.parameter(network === sdkConfig.network, `Network is not valid`);

    this._network = sdkConfig.network;
    this._core = core || util.common.generateRandomBytesByLength(BITMARK_CONFIG.core.length);
    this._accountKey = AccountKey.fromBuffer(generateSeedKey(BITMARK_CONFIG.key.auth_key_index, this._core), this._network);
};

// STATIC METHODS
Account.fromSeed = function (seedString) {
    let seed = Seed.fromString(seedString);
    return new Account(seed.getNetwork(), seed.getCore());
};

Account.fromRecoveryPhrase = function (recoveryPhraseString) {
    let recoveryPhrase = RecoveryPhrase.fromString(recoveryPhraseString);
    return new Account(recoveryPhrase.getNetwork(), recoveryPhrase.getCore());
};

Account.parseAccountNumber = function (accountNumber) {
    assert.parameter(_.isString(accountNumber), `account number must be a string`);
    return AccountKey.parseAccountNumber(accountNumber);
};

Account.isValidAccountNumber = function (accountNumber) {
    util.common.makeSureSDKInitialized();
    let sdkConfig = global.getSDKConfig();

    try {
        let accountInfo = AccountKey.parseAccountNumber(accountNumber);
        return accountInfo.network === sdkConfig.network;
    } catch (error) {
        return false;
    }
};

// PROTOTYPE METHODS
Account.prototype.getAccountNumber = function () {
    return this._accountKey.getAccountNumber();
};

Account.prototype.getNetwork = function () {
    return this._network;
};

Account.prototype.getSeed = function () {
    let seed = Seed.fromCore(this._core, this._network);
    return seed.toString();
};

Account.prototype.getRecoveryPhrase = function () {
    let recoveryPhrase = RecoveryPhrase.fromCore(this._core, this._network);
    return recoveryPhrase.toString();
};

// INTERNAL METHODS
function generateSeedKey(index, randomBytes) {
    let counter = new BigInteger(index.toString());
    let counterBuffer = counter.toBuffer('be', BITMARK_CONFIG.core.counter_length);
    let nonce = Buffer.alloc(BITMARK_CONFIG.core.nonce_length, 0);
    let seedKey = nacl.secretbox(counterBuffer, nonce, randomBytes);
    return seedKey;
}

module.exports = Account;
