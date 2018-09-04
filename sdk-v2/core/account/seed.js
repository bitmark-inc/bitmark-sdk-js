'use strict';
const _ = require('lodash');

const BITMARK_CONFIG = require('../../config/bitmark-config');
const NETWORKS_CONFIG = require('../../config/network-config');
const common = require('../../util/common.js');
const varint = require('../../util/varint.js');
const base58 = require('../../util/base58.js');
const assert = require('../../util/assert.js');
const SDKError = require('../../util/sdk-error');
const seedVersionEncoded = varint.encode(BITMARK_CONFIG.seed.version);


// CONSTRUCTOR
let Seed = function (seedInfo) {
    assert.parameter(seedInfo, 'Seed info is required');
    Object.assign(this, seedInfo);
};

// STATIC METHODS
Seed.fromString = function (seedString) {
    assert.parameter(_.isString(seedString), 'seed needs to be a string');
    return new Seed(parseSeedString(seedString));
};

Seed.fromCore = function (core, network) {
    assert.parameter(Buffer.isBuffer(core), 'core should be a buffer');
    assert.parameter(core.length === BITMARK_CONFIG.core.length, `core length should be ${BITMARK_CONFIG.core.length}`);

    const version = BITMARK_CONFIG.seed.version;
    return new Seed({
        _core: core,
        _string: exportToString(core, network, version),
        _network: network,
        _version: version
    });
};


// PROTOTYPE METHODS
Seed.prototype.toString = function () {
    return this._string;
};

Seed.prototype.getNetwork = function () {
    return this._network;
};

Seed.prototype.getCore = Seed.prototype.toBuffer = function () {
    return this._core;
};

Seed.prototype.getVersion = function () {
    return this._version;
};


// INTERNAL METHODS
function exportToString(core, network, version) {
    assert.parameter(core && Buffer.isBuffer(core) && core.length === BITMARK_CONFIG.core.length, 'unrecognized core');
    assert.parameter(network, 'unrecognized network');
    assert.parameter(version, 'unrecognized version');

    let networkConfig = NETWORKS_CONFIG[network];
    let networkValue = varint.encode(networkConfig.core_value);
    let versionValue = varint.encode(version);
    let exportedSeed = Buffer.concat([BITMARK_CONFIG.seed.magic, versionValue, networkValue, core]);
    let checksum = common.sha3_256(exportedSeed).slice(0, BITMARK_CONFIG.seed.checksum_length);
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
    checksum = seedStringBuffer.slice(seedStringBuffer.length - BITMARK_CONFIG.seed.checksum_length, seedStringBuffer.length);
    rest = seedStringBuffer.slice(0, seedStringBuffer.length - BITMARK_CONFIG.seed.checksum_length);
    checksumVerification = common.sha3_256(rest);
    checksumVerification = checksumVerification.slice(0, BITMARK_CONFIG.seed.checksum_length);
    assert.parameter(common.bufferEqual(checksum, checksumVerification), 'wrong checksum for given seed');


    // Verify magic number
    let magicNumber;
    magicNumber = rest.slice(0, BITMARK_CONFIG.seed.magic.length);
    assert.parameter(common.bufferEqual(magicNumber, BITMARK_CONFIG.seed.magic), 'wrong magic number for given seed');
    rest = rest.slice(BITMARK_CONFIG.seed.magic.length);

    // Verify version
    let version;
    version = rest.slice(0, seedVersionEncoded.length);
    assert.parameter(common.bufferEqual(version, seedVersionEncoded), 'unrecognized seed version');
    rest = rest.slice(seedVersionEncoded.length);

    let networkValue, network;
    networkValue = rest.slice(0, BITMARK_CONFIG.seed.network_length).readInt8(0);
    if (networkValue === NETWORKS_CONFIG.livenet.core_value) {
        network = NETWORKS_CONFIG.livenet;
    } else if (networkValue === NETWORKS_CONFIG.testnet.core_value) {
        network = NETWORKS_CONFIG.testnet;
    } else {
        throw SDKError.invalidParameter('unrecognized network value');
    }

    let core = rest.slice(BITMARK_CONFIG.seed.network_length);
    assert.parameter(core.length === BITMARK_CONFIG.core.length, 'wrong core length');

    return {
        _core: core,
        _string: seedString,
        _network: network.name,
        _version: version.readUInt8(0)
    };
}


module.exports = Seed;
