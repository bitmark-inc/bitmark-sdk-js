const common = require('./util/common.js');
const varint = require('./util/varint.js');
const base58 = require('./util/base58.js');
const assert = require('./util/assert.js');
const _ = require('lodash');

const networks = require('./networks.js');
const config = require('./config.js');

const BigInteger = require('bn.js');
const SDKError = require('./error');

// dummy internal object
function AccountNumberInfo(values){
  this.getValues = function(){ return values; };
}

function parseAccountNumberString(accountNumberString) {
  let accountNumberBuffer = base58.decode(accountNumberString);

  let keyVariant = varint.decode(accountNumberBuffer);
  let keyVariantBuffer = keyVariant.toBuffer();

  // check for whether this is an account number
  let keyPartVal = new BigInteger(config.key.part.public_key);
  assert.parameter(keyVariant.and(new BigInteger(1)).eq(keyPartVal), 'not an account number string');
  // detect network
  let networkVal = keyVariant.shrn(1).and(new BigInteger(0x01)).toNumber();
  let network = networkVal === networks.livenet.account_number_value ? networks.livenet : networks.testnet;
  // key type
  let keyTypeVal = keyVariant.shrn(4).and(new BigInteger(0x07)).toNumber();
  let keyType = common.getKeyTypeByValue(keyTypeVal);
  assert.parameter(keyType, 'unrecognized key type');
  // check the length of the account number
  let accountNumberLength = keyVariantBuffer.length + keyType.pubkey_length + config.key.checksum_length;
  assert.parameter(accountNumberLength === accountNumberBuffer.length, `key type ${keyType.name.toUpperCase()} must be ${accountNumberLength} bytes`);

  // get public key
  let pubKey = accountNumberBuffer.slice(keyVariantBuffer.length, accountNumberLength - config.key.checksum_length);

  // check checksum
  let checksum = common.sha3_256(accountNumberBuffer.slice(0, keyVariantBuffer.length + keyType.pubkey_length));
  checksum = checksum.slice(0, config.key.checksum_length);
  assert.parameter(common.bufferEqual(checksum, accountNumberBuffer.slice(accountNumberLength-config.key.checksum_length, accountNumberLength)), 'checksum mismatch');

  return new AccountNumberInfo({
    _prefix: keyVariantBuffer,
    _pubKey: pubKey,
    _network: network.name,
    _keyType: keyType.name,
    _string: accountNumberString,
  });
}

/**
 * build account number info from public key, network and type
 * @param  {buffer}
 * @param  {network}
 * @param  {keyType}
 * @return {info object}
 */
function buildAccountNumber(pubKey, network, keyType) {
  let keyTypeVal, keyVariantVal;
  let keyVariantBuffer, checksumBuffer;
  let accountNumberBuffer, base58AccountNumber;

  assert.parameter(pubKey.length === keyType.pubkey_length,
    `public key for key type ${keyType.name} must be ${keyType.pubkey_length} bytes`);

  // TODO: process the case when key variant proceed

  // prepare key variant byte
  keyTypeVal = new BigInteger(keyType.value);
  keyVariantVal = keyTypeVal.shln(4); // for key type from bit 5 -> 7
  keyVariantVal.ior(new BigInteger(config.key.part.public_key.toString())); // first bit indicates account number/auth key
  keyVariantVal.ior(new BigInteger(network.account_number_value).ishln(1)); // second bit indicates net
  keyVariantBuffer = varint.encode(keyVariantVal);

  checksumBuffer = common.sha3_256(Buffer.concat([keyVariantBuffer, pubKey], keyVariantBuffer.length + keyType.pubkey_length));
  checksumBuffer = checksumBuffer.slice(0, config.key.checksum_length);

  accountNumberBuffer = Buffer.concat([keyVariantBuffer, pubKey, checksumBuffer], keyVariantBuffer.length + keyType.pubkey_length + config.key.checksum_length);
  base58AccountNumber = base58.encode(accountNumberBuffer);

  return new AccountNumberInfo({
    _prefix: keyVariantBuffer,
    _pubKey: pubKey,
    _network: network.name,
    _keyType: keyType.name,
    _string: base58AccountNumber
  });
}

function AccountNumber(data, network, type) {
  if (!(this instanceof AccountNumber)) {
    return new AccountNumber(data, network, type);
  }

  if (Buffer.isBuffer(data)) {
    return AccountNumber.fromPublicKey(data, network, type);
  }

  if (_.isString(data)) {
    return AccountNumber.fromString(data);
  }

  if (data instanceof AccountNumberInfo) {
    common.addImmutableProperties(this, data.getValues());
    return;
  }

  throw SDKError.invalidParameter('unrecognized inputs');
}

AccountNumber.fromPublicKey = function(pubkey, network, type) {
  // verify network parameter
  network = network || networks.livenet;
  if (_.isString(network)) {
    network = networks[network];
    assert.parameter(network, 'unrecognized network');
  }
  assert.parameter(_.isFinite(network.account_number_value), 'missing account number information in network parameter');

  // verify type parameter
  type = type || config.key.type.ed25519;
  if (_.isString(type)) {
    type = config.key.type[type.toLowerCase()];
  }
  assert.parameter(type.name && config.key.type[type.name], 'unrecognized key type');

  // verify pubkey
  assert.parameter(pubkey, 'missing public key');
  if (_.isString(pubkey) && /^([0-9a-f]{2})+$/.test(pubkey.toLowerCase())) {
    pubkey = new Buffer(pubkey.toLowerCase(), 'hex');
  }
  assert.parameter(Buffer.isBuffer(pubkey), `unrecognized key type format`);

  return new AccountNumber(buildAccountNumber(pubkey, network, type));
};

AccountNumber.fromString = function(accountNumberString) {
  assert.parameter(_.isString(accountNumberString), `account number must be a string`);
  accountNumberString = common.normalizeStr(accountNumberString);
  return new AccountNumber(parseAccountNumberString(accountNumberString));
};

AccountNumber.isValid = function(accountNumberString, networkName) {
  assert.parameter(_.isString(accountNumberString), `account number must be a string`);
  accountNumberString = common.normalizeStr(accountNumberString);
  try {
    let accountNumber = AccountNumber.fromString(accountNumberString);
    if (networkName) {
      return networkName && accountNumber.getNetwork() == networkName;
    } else {
      return true;
    }
  } catch (error) {
    return false;
  }
};

AccountNumber.prototype.toString = function() {
  return this._string;
};

AccountNumber.prototype.getNetwork = function(){
  return this._network;
};

AccountNumber.prototype.getPublicKey = function(){
  return this._pubKey.toString('hex');
};

AccountNumber.prototype.getKeyType = function(){
  return this._keyType;
};

AccountNumber.prototype.pack = function(){
  return Buffer.concat([this._prefix, this._pubKey], this._prefix.length + this._pubKey.length);
};

module.exports = AccountNumber;
