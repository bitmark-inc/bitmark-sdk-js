const common = require('./util/common.js');
const varint = require('./util/varint.js');
const base58 = require('./util/base58.js');
const assert = require('./util/assert.js');
const _ = require('lodash');

const networks = require('./networks.js');
const config = require('./config.js');

const BigInteger = require('bn.js');
const keyHandlers = require('./key-types/key-handlers.js');
const AccountNumber = require('./account-number.js');
const SDKError = require('./error');

function AuthKeyInfo(values) {
  this.getValues = function() { return values; };
}

function _verifyNetwork(network) {
  network = network || networks.livenet;
  if (_.isString(network)) {
    network = networks[network];
    assert.parameter(network, 'unrecognized network');
  }
  assert.parameter(_.isFinite(network.kif_value), 'missing kif information in network parameter');
  return network;
}

function _verifyType(type) {
  type = type || config.key.type.ed25519;
  if (_.isString(type)) {
    type = config.key.type[type.toLowerCase()];
  }
  assert.parameter(type.name && config.key.type[type.name], 'unrecognized key type');
  return type;
}

function parseKIFString(kifString) {
  let kifBuffer = base58.decode(kifString);

  let keyVariant = varint.decode(kifBuffer);
  let keyVariantBufferLength = keyVariant.toBuffer().length;
  keyVariantBufferLength = keyVariantBufferLength || 1;

  // check for whether this is a kif
  let keyPartVal = new BigInteger(config.key.part.auth_key);
  assert.parameter(keyVariant.and(new BigInteger(1)).eq(keyPartVal), 'not a kif string');
  // detect network
  let networkVal = keyVariant.shrn(1).and(new BigInteger(0x01)).toNumber();
  let network = networkVal === networks.livenet.account_number_value ? networks.livenet : networks.testnet;
  // key type
  let keyTypeVal = keyVariant.shrn(4).and(new BigInteger(0x07)).toNumber();
  let keyType = common.getKeyTypeByValue(keyTypeVal);
  assert.parameter(keyType, 'unrecognized key type');

  // check the length of kif
  let kifLength = keyVariantBufferLength + keyType.seed_length + config.key.checksum_length;
  assert.parameter(kifLength === kifBuffer.length, `KIF for ${keyType.name} must be ${kifLength} bytes`);

  // get private key
  let seed = kifBuffer.slice(keyVariantBufferLength, kifLength - config.key.checksum_length);

  // check checksum
  let checksum = common.sha3_256(kifBuffer.slice(0 ,kifLength - config.key.checksum_length));
  checksum = checksum.slice(0, config.key.checksum_length);
  assert.parameter(common.bufferEqual(checksum, kifBuffer.slice(kifLength-config.key.checksum_length, kifLength)), 'checksum mismatch');

  // get account number
  let keyTypeHandler = keyHandlers.getHandler(keyType.name);
  let keyPair = keyTypeHandler.generateKeyPairFromSeed(seed);

  return new AuthKeyInfo({
    _accountNumber: new AccountNumber(keyPair.pubKey, network, keyType),
    _priKey: keyPair.priKey,
    _type: keyType.name,
    _network: network.name,
    _kif: kifString
  });
}


function buildAuthKey(keyPair, network, type) {
  let keyTypeHanlder = keyHandlers.getHandler(type.name);
  let seed;
  if (Buffer.isBuffer(keyPair)) { // keyPair is private key/seed only
    if (keyPair.length === type.prikey_length) {
      keyPair = keyTypeHanlder.generateKeyPairFromPriKey(keyPair); // keyPair from private key
      seed = keyTypeHanlder.getSeedFromPriKey(keyPair.priKey);
    } else if (keyPair.length === type.seed_length) { // keyPair is actually seed
      seed = keyPair;
      keyPair = keyTypeHanlder.generateKeyPairFromSeed(seed); // keyPair from seed
    } else {
      throw SDKError.invalidParameter('unrecognized buffer format');
    }
  } else {
    seed = keyTypeHanlder.getSeedFromPriKey(keyPair.priKey);
  }

  let keyVariantVal, keyVariantBuffer;
  let keyPartVal, networkVal, keyTypeVal;
  let checksum, kifBuffer, kif;

  keyPartVal = new BigInteger(config.key.part.auth_key);
  networkVal = new BigInteger(network.kif_value);
  keyTypeVal = new BigInteger(type.value);

  keyVariantVal = keyTypeVal.shln(3).or(networkVal);
  keyVariantVal.ishln(1).ior(keyPartVal);
  keyVariantBuffer = varint.encode(keyVariantVal);

  checksum = common.sha3_256(Buffer.concat([keyVariantBuffer, seed], keyVariantBuffer.length+ seed.length));
  checksum = checksum.slice(0, config.key.checksum_length);
  kifBuffer = Buffer.concat([keyVariantBuffer, seed, checksum], keyVariantBuffer.length + seed.length + checksum.length);
  kif = base58.encode(kifBuffer);
  return new AuthKeyInfo({
    _accountNumber: new AccountNumber(keyPair.pubKey, network, type),
    _priKey: keyPair.priKey,
    _type: type.name,
    _network: network.name,
    _kif: kif
  });
}

function newAuthKey(network, type) {
  let keyTypeHanlder = keyHandlers.getHandler(type.name);
  let keyPair = keyTypeHanlder.generateKeyPair();
  return buildAuthKey(keyPair, network, type);
}

function AuthKey(network, type) {
  if (!(this instanceof AuthKey)) {
    return new AuthKey(network, type);
  }

  // detect if this is the call from another constructor
  if (network instanceof AuthKeyInfo) {
    common.addImmutableProperties(this, network.getValues());
    return;
  }

  // If this is not a call from another constructor, create new private key
  network = _verifyNetwork(network);
  type = _verifyType(type);

  let data = newAuthKey(network, type);
  common.addImmutableProperties(this, data.getValues());
}

AuthKey.fromKIF = function(kifString) {
  assert.parameter(_.isString(kifString), 'KIF string is required');
  return new AuthKey(parseKIFString(kifString));
};

AuthKey.fromBuffer = function(data, network, type) {
  // verify data
  assert.parameter(data, 'buffer is required');
  if (_.isString(data) && /^([0-9a-f]{2})+$/.test(data.toLowerCase())) {
    data = new Buffer(data.toLowerCase(), 'hex');
  }
  assert.parameter(Buffer.isBuffer(data), 'unrecognized buffer format');

  network = _verifyNetwork(network);
  type = _verifyType(type);

  return new AuthKey(buildAuthKey(data, network, type));
};

AuthKey.prototype.sign = function(message) {
  let keyHandler = keyHandlers.getHandler(this.getType());
  return keyHandler.sign(Buffer.from(message, 'utf8'), this.toBuffer());
}

AuthKey.prototype.toBuffer = function(){ return this._priKey; };

AuthKey.prototype.toString = function(){ return this._priKey.toString('hex'); };

AuthKey.prototype.toKIF = function(){ return this._kif; };

AuthKey.prototype.getNetwork = function(){ return this._network; };

AuthKey.prototype.getType = function(){ return this._type; };

AuthKey.prototype.getAccountNumber = function(){ return this._accountNumber; };

module.exports = AuthKey;
