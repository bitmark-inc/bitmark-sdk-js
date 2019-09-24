'use strict';
const _ = require('lodash');

const bitmarkCore = require('../util/bitmark-core');
const common = require('../util/common');
const assert = require('../util/assert');
const Seed = require('./account/seed');
const RecoveryPhrase = require('./account/recovery-phrase');
const AccountKey = require('./account/account-key');
const keyHandlers = require('./account/key-types/key-handlers.js');


// CONSTRUCTOR
let Account = function (network, core) {
    common.makeSureSDKInitialized();
    let sdkConfig = global.getSDKConfig();
    if (network) assert.parameter(network === sdkConfig.network, `Network is not valid`);

    this._network = sdkConfig.network;
    this._core = core || bitmarkCore.generateCore(this._network);
    let seedKey = bitmarkCore.coreToSeedKey(this._core);

    assert.parameter(seedKey.network === this._network, `Network from core is not valid`);
    this._accountKey = AccountKey.fromBuffer(seedKey.seed, this._network);
};

// STATIC METHODS
Account.fromSeed = function (seedString) {
    let seed = Seed.fromString(seedString);
    return new Account(seed.getNetwork(), seed.getCore());
};

Account.fromRecoveryPhrase = function (recoveryPhraseString, lang) {
    let recoveryPhrase = RecoveryPhrase.fromString(recoveryPhraseString, lang);
    return new Account(recoveryPhrase.getNetwork(), recoveryPhrase.getCore());
};

Account.parseAccountNumber = function (accountNumber) {
    assert.parameter(_.isString(accountNumber), `account number must be a string`);
    return AccountKey.parseAccountNumber(accountNumber);
};

Account.isValidAccountNumber = function (accountNumber) {
    common.makeSureSDKInitialized();
    let sdkConfig = global.getSDKConfig();

    try {
        let accountInfo = AccountKey.parseAccountNumber(accountNumber);
        return accountInfo.network === sdkConfig.network;
    } catch (error) {
        return false;
    }
};

Account.verify = function(accountNumber, message, signature) {
    assert.parameter(Buffer.isBuffer(signature), `signature must be a buffer`);

    common.makeSureSDKInitialized();
    let sdkConfig = global.getSDKConfig();

    let accountNumberInfo = AccountKey.parseAccountNumber(accountNumber);
    assert.parameter(accountNumberInfo.network === sdkConfig.network, `Network is not valid`);

    let messageBuffer = Buffer.isBuffer(message) ? message : Buffer.from(message);
    let keyHandler = keyHandlers.getHandler(accountNumberInfo.keyType.name);
    let isCorrectSignature = keyHandler.verify(accountNumberInfo.pubKey, messageBuffer, signature);
    return isCorrectSignature;
}

Account.packagePublicKeyFromAccountNumber = function (accountNumber) {
    let accountInfo = AccountKey.parseAccountNumber(accountNumber);
    return bitmarkCore.packagePublicKey(accountInfo.network, accountInfo.pubKey);
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

Account.prototype.getRecoveryPhrase = function (lang) {
    let recoveryPhrase = RecoveryPhrase.fromCore(this._core, this._network, lang);
    return recoveryPhrase.toString();
};

Account.prototype.sign = function (data) {
    return this._accountKey.sign(data);
};

Account.prototype.packagePublicKey = function () {
    return bitmarkCore.packagePublicKey(this._network, this._accountKey._pubKey);
};


module.exports = Account;
