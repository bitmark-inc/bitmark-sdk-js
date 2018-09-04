'use strict';
const _ = require('lodash');
const BigInteger = require('bn.js');
const nacl = require('tweetnacl-nodewrap');

const BITMARK_CONFIG = require('../config/bitmark-config');
const NETWORKS_CONFIG = require('../config/network-config');
const common = require('../util/common');
const varint = require('../util/varint');
const assert = require('../util/assert');
const Seed = require('./account/seed');
const RecoveryPhrase = require('./account/recovery-phrase');
const AccountKey = require('./account/account-key');


// CONSTRUCTOR
let Account = function (network, core) {
    common.makeSureSDKInitialized();
    let sdkConfig = global.getSDKConfig();
    if (network) assert.parameter(network === sdkConfig.network, `Network is not valid`);

    this._network = sdkConfig.network;
    this._core = core || common.generateRandomBytesByLength(BITMARK_CONFIG.core.length);
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
    common.makeSureSDKInitialized();
    let sdkConfig = global.getSDKConfig();

    try {
        let accountInfo = AccountKey.parseAccountNumber(accountNumber);
        return accountInfo.network === sdkConfig.network;
    } catch (error) {
        return false;
    }
};

Account.packagePublicKeyFromAccountNumber = function (accountNumber) {
    let accountInfo = AccountKey.parseAccountNumber(accountNumber);
    return packagePublicKey(accountInfo.network, accountInfo.pubKey);
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

Account.prototype.sign = function (data) {
    return this._accountKey.sign(data);
};

Account.prototype.packagePublicKey = function () {
    return packagePublicKey(this._network, this._accountKey._pubKey);
};


// INTERNAL METHODS
function generateSeedKey(index, randomBytes) {
    let counter = new BigInteger(index.toString());
    let counterBuffer = counter.toBuffer('be', BITMARK_CONFIG.core.counter_length);
    let nonce = Buffer.alloc(BITMARK_CONFIG.core.nonce_length, 0);
    let seedKey = nacl.secretbox(counterBuffer, nonce, randomBytes);
    return seedKey;
}

function packagePublicKey(network, publicKey) {
    const networkConfig = NETWORKS_CONFIG[network];
    let keyType = BITMARK_CONFIG.key.type.ed25519;
    let keyTypeVal = new BigInteger(keyType.value);
    let keyVariantVal = keyTypeVal.shln(4); // for key type from bit 5 -> 7

    keyVariantVal.ior(new BigInteger(BITMARK_CONFIG.key.part.public_key.toString())); // first bit indicates account number/auth key
    keyVariantVal.ior(new BigInteger(networkConfig.account_number_value).ishln(1)); // second bit indicates net

    let keyVariantBuffer = varint.encode(keyVariantVal);
    return Buffer.concat([keyVariantBuffer, publicKey], keyVariantBuffer.length + publicKey.length);
}


module.exports = Account;
