'use strict';

const common = require('./util/common.js');
const varint = require('./util/varint.js');
const base58 = require('./util/base58.js');
const assert = require('./util/assert.js');
const _ = require('lodash');

const SDKError = require('./error');
const networks = require('./networks.js');
const config = require('./config.js');

const seedVersionEncoded = varint.encode(config.seed.version);

function SeedInfo(values) {
  this.getValues = function() { return values; }
}

function standardizeNetwork(network) {
  network = network || networks.livenet;
  if (_.isString(network)) {
    network = networks[network];
    assert.parameter(network, 'unrecognized network');
  }
  return network;
}

function standardzeVersion(version) {
  version = version || config.seed.version;
  assert.parameter(version === config.seed.version, 'version is not supported');
  return version;
}

function exportToString(core, network, version) {
  assert.parameter(core && Buffer.isBuffer(core) && core.length === config.core.length, 'unrecognized core');
  assert.parameter(network, 'unrecognized network');
  assert.parameter(version, 'unrecognized version');

  let networkValue = varint.encode(network.core_value);
  let versionValue = varint.encode(version);
  let exportedSeed = Buffer.concat([config.seed.magic, versionValue, networkValue, core]);
  let checksum = common.sha3_256(exportedSeed).slice(0, config.seed.checksum_length);
  exportedSeed = Buffer.concat([exportedSeed, checksum]);
  return base58.encode(exportedSeed);
}

function parseSeedString(seedString) {
  let seedStringBuffer, rest;
  try {
    seedStringBuffer = base58.decode(seedString);
  } catch (error) {
    throw SDKError.invalidParameter('seed string is not in base58 format');
  }

  // Verify checksum
  let checksum, checksumVerification;
  checksum = seedStringBuffer.slice(seedStringBuffer.length - config.seed.checksum_length, seedStringBuffer.length);
  rest = seedStringBuffer.slice(0, seedStringBuffer.length - config.seed.checksum_length);
  checksumVerification = common.sha3_256(rest);
  checksumVerification = checksumVerification.slice(0, config.seed.checksum_length);
  assert.parameter(common.bufferEqual(checksum, checksumVerification), 'wrong checksum for given seed');


  // Verify magic number
  let magicNumber;
  magicNumber = rest.slice(0, config.seed.magic.length);
  assert.parameter(common.bufferEqual(magicNumber, config.seed.magic), 'wrong magic number for given seed');
  rest = rest.slice(config.seed.magic.length);

  // Verify version
  let version;
  version = rest.slice(0, seedVersionEncoded.length);
  assert.parameter(common.bufferEqual(version, seedVersionEncoded), 'unrecognized seed version');
  rest = rest.slice(seedVersionEncoded.length);

  let networkValue, network;
  networkValue = rest.slice(0, config.seed.network_length).readInt8(0);
  if (networkValue === networks.livenet.core_value) {
    network = networks.livenet;
  } else if (networkValue === networks.testnet.core_value) {
    network = networks.testnet;
  } else {
    throw SDKError.invalidParameter('unrecognized network value');
  }

  let core = rest.slice(config.seed.network_length);
  assert.parameter(core.length === config.core.length, 'wrong core length');

  return new SeedInfo({
    _core: core,
    _string: seedString,
    _network: network.name,
    _version: version.readUInt8(0)
  });
}

function Seed(network, version) {
  if (!(this instanceof Seed)) {
    return new Seed(network, version);
  }

  if (network instanceof SeedInfo) {
    common.addImmutableProperties(this, network.getValues());
    return;
  }

  throw SDKError.operationFobidden('calling Seed constructor directly has not been supported anymore');
}

Seed.fromBase58 = Seed.fromString = function(seedString) {
  assert.parameter(_.isString(seedString), 'seed needs to be a string');
  return new Seed(parseSeedString(seedString));
}

Seed.fromCore = Seed.fromBuffer = function(core, network, version) {
  assert.parameter(Buffer.isBuffer(core), 'core should be a buffer');
  assert.parameter(core.length === config.core.length, `core length should be ${config.core.length}`);

  network = standardizeNetwork(network);
  version = standardzeVersion(version);
  let seedInfo = new SeedInfo({
    _core: core,
    _string: exportToString(core, network, version),
    _network: network.name,
    _version: version
  });
  return new Seed(seedInfo);
}

Seed.isValid = function(seedString) {
  try {
    parseSeedString(seedString);
    return true;
  } catch (error) {
    return false;
  }
}

Seed.prototype.toBase58 = Seed.prototype.toString = function() { return this._string; };
Seed.prototype.getNetwork = function() { return this._network; };
Seed.prototype.getCore = Seed.prototype.toBuffer = function() { return this._core };
Seed.prototype.getVersion = function() { return this._version };

module.exports = exports = Seed;
