'use strict';
const _ = require('lodash');
const BigInteger = require('bn.js');

const keyHandlers = require('./key-types/key-handlers.js');
const BITMARK_CONFIG = require('../../config/bitmark-config');
const NETWORKS_CONFIG = require('../../config/network-config');
const common = require('../../util/common.js');
const varint = require('../../util/varint.js');
const base58 = require('../../util/base58.js');
const assert = require('../../util/assert.js');


// CONSTRUCTOR
let AccountKey = function (accountKeyInfo) {
    assert.parameter(accountKeyInfo, 'Account Key info is required');
    Object.assign(this, accountKeyInfo);
};


// STATIC METHODS
AccountKey.fromBuffer = function (buffer, network) {
    // verify data
    assert.parameter(buffer, 'buffer is required');
    if (_.isString(buffer) && /^([0-9a-f]{2})+$/.test(buffer.toLowerCase())) {
        buffer = new Buffer(buffer.toLowerCase(), 'hex');
    }
    assert.parameter(Buffer.isBuffer(buffer), 'unrecognized buffer format');

    return new AccountKey(buildAccountKey(buffer, network));
};

AccountKey.parseAccountNumber = function (accountNumber) {
    let accountNumberBuffer = base58.decode(accountNumber);

    let keyVariant = varint.decode(accountNumberBuffer);
    let keyVariantBuffer = keyVariant.toBuffer();

    // check for whether this is an account number
    let keyPartVal = new BigInteger(BITMARK_CONFIG.key.part.public_key);
    assert.parameter(keyVariant.and(new BigInteger(1)).eq(keyPartVal), 'not an account number string');
    // detect network
    let networkVal = keyVariant.shrn(1).and(new BigInteger(0x01)).toNumber();
    let network = networkVal === NETWORKS_CONFIG.livenet.account_number_value ? NETWORKS_CONFIG.livenet : NETWORKS_CONFIG.testnet;
    let sdkConfig = global.getSDKConfig();
    assert.parameter(network.name === sdkConfig.network, `network is not valid: ${network.name}`);
    // key type
    let keyTypeVal = keyVariant.shrn(4).and(new BigInteger(0x07)).toNumber();
    let keyType = common.getKeyTypeByValue(keyTypeVal);
    assert.parameter(keyType, 'unrecognized key type');
    // check the length of the account number
    let accountNumberLength = keyVariantBuffer.length + keyType.pubkey_length + BITMARK_CONFIG.key.checksum_length;
    assert.parameter(accountNumberLength === accountNumberBuffer.length, `key type ${keyType.name.toUpperCase()} must be ${accountNumberLength} bytes`);

    // get public key
    let pubKey = accountNumberBuffer.slice(keyVariantBuffer.length, accountNumberLength - BITMARK_CONFIG.key.checksum_length);

    // check checksum
    let checksum = common.sha3_256(accountNumberBuffer.slice(0, keyVariantBuffer.length + keyType.pubkey_length));
    checksum = checksum.slice(0, BITMARK_CONFIG.key.checksum_length);
    assert.parameter(common.bufferEqual(checksum, accountNumberBuffer.slice(accountNumberLength - BITMARK_CONFIG.key.checksum_length, accountNumberLength)), 'checksum mismatch');

    return {
        network: network.name,
        pubKey: pubKey,
        keyType: keyType
    };
};


// PROTOTYPE METHODS
AccountKey.prototype.sign = function (message) {
    let keyHandler = keyHandlers.getHandler(this.getType());
    let messageBuffer = Buffer.isBuffer(message) ? message : Buffer.from(message, 'utf8');
    return keyHandler.sign(messageBuffer, this.getPrivateKey());
};

AccountKey.prototype.getPrivateKey = function () {
    return this._priKey;
};

AccountKey.prototype.printPrivateKey = function () {
    return this._priKey.toString('hex');
};

AccountKey.prototype.printPublicKey = function () {
    return this._pubKey.toString('hex');
};

AccountKey.prototype.getNetwork = function () {
    return this._network;
};

AccountKey.prototype.getType = function () {
    return this._type;
};

AccountKey.prototype.getAccountNumber = function () {
    return this._accountNumber;
};


// INTERNAL METHODS
function buildAccountKey(buffer, network) {
    let keyType = BITMARK_CONFIG.key.type.ed25519;
    let keyHandler = keyHandlers.getHandler(keyType.name);
    let keyPair = keyHandler.generateKeyPairFromSeed(buffer);

    return {
        _accountNumber: generateAccountNumber(keyPair.pubKey, network, keyType),
        _priKey: keyPair.priKey,
        _pubKey: keyPair.pubKey,
        _network: network,
        _type: keyType.name
    };
}

function generateAccountNumber(pubKey, network, keyType) {
    assert.parameter(pubKey.length === keyType.pubkey_length, `public key for key type ${keyType.name} must be ${keyType.pubkey_length} bytes`);

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


module.exports = AccountKey;
