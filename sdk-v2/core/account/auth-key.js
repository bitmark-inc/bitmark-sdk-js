'use strict';

const _ = require('lodash');
const BigInteger = require('../../../node_modules/bn.js/lib/bn');
const keyHandlers = require('./key-types/key-handlers.js');
const BITMARK_CONFIG = require('../../config/bitmark-config');
const NETWORKS_CONFIG = require('../../config/network-config');
const common = require('../../util/common.js');
const varint = require('../../util/varint.js');
const base58 = require('../../util/base58.js');
const assert = require('../../util/assert.js');


let AuthKey = function (authKeyInfo) {
    assert.parameter(authKeyInfo, 'Auth Key info is required');
    Object.assign(this, authKeyInfo);
};

// STATIC METHODS
AuthKey.fromBuffer = function (buffer, network) {
    // verify data
    assert.parameter(buffer, 'buffer is required');
    if (_.isString(buffer) && /^([0-9a-f]{2})+$/.test(buffer.toLowerCase())) {
        buffer = new Buffer(buffer.toLowerCase(), 'hex');
    }
    assert.parameter(Buffer.isBuffer(buffer), 'unrecognized buffer format');

    return new AuthKey(buildAuthKey(buffer, network));
};

// PROTOTYPE METHODS
AuthKey.prototype.sign = function (message) {
    let keyHandler = keyHandlers.getHandler(this.getType());
    return keyHandler.sign(Buffer.from(message, 'utf8'), this.getPrivateKey());
};

AuthKey.prototype.getPrivateKey = function () {
    return this._priKey;
};

AuthKey.prototype.printPrivateKey = function () {
    return this._priKey.toString('hex');
};

AuthKey.prototype.getNetwork = function () {
    return this._network;
};

AuthKey.prototype.getType = function () {
    return this._type;
};

AuthKey.prototype.getAccountNumber = function () {
    return this._accountNumber;
};

function buildAuthKey(buffer, network) {
    let keyType = BITMARK_CONFIG.key.type.ed25519;
    let keyHandler = keyHandlers.getHandler(keyType.name);
    let keyPair = keyHandler.generateKeyPairFromSeed(buffer);

    return {
        _accountNumber: generateAccountNumber(keyPair.pubKey, network, keyType),
        _priKey: keyPair.priKey,
        _network: network,
        _type: keyType.name
    };
}

function generateAccountNumber(pubKey, network, keyType) {
    assert.parameter(pubKey.length === keyType.pubkey_length,
        `public key for key type ${keyType.name} must be ${keyType.pubkey_length} bytes`);

    const networkConfig = NETWORKS_CONFIG[network];
    let keyTypeVal, keyVariantVal;
    let keyVariantBuffer, checksumBuffer;
    let accountNumberBuffer, base58AccountNumber;

    // prepare key variant byte
    keyTypeVal = new BigInteger(keyType.value);
    keyVariantVal = keyTypeVal.shln(4); // for key type from bit 5 -> 7
    keyVariantVal.ior(new BigInteger(BITMARK_CONFIG.key.part.public_key.toString())); // first bit indicates account number/auth key
    keyVariantVal.ior(new BigInteger(networkConfig.account_number_value).ishln(1)); // second bit indicates net
    keyVariantBuffer = varint.encode(keyVariantVal);

    checksumBuffer = common.sha3_256(Buffer.concat([keyVariantBuffer, pubKey], keyVariantBuffer.length + keyType.pubkey_length));
    checksumBuffer = checksumBuffer.slice(0, BITMARK_CONFIG.key.checksum_length);

    accountNumberBuffer = Buffer.concat([keyVariantBuffer, pubKey, checksumBuffer], keyVariantBuffer.length + keyType.pubkey_length + BITMARK_CONFIG.key.checksum_length);
    base58AccountNumber = base58.encode(accountNumberBuffer);

    return base58AccountNumber;
}

module.exports = AuthKey;
