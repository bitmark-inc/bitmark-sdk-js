'use strict';
const _ = require('lodash');

const BITMARK_CONFIG = require('../../config/bitmark-config');
const assert = require('../../util/assert');
const bitmarkCore = require('../../util/bitmark-core');
const networkUtil = require('../../util/network');


// CONSTRUCTOR
let Seed = function (seedInfo) {
    assert.parameter(seedInfo, 'Seed info is required');
    Object.assign(this, seedInfo);
};

// STATIC METHODS
Seed.fromString = function (seedString) {
    assert.parameter(_.isString(seedString), 'seed needs to be a string');

    let core = bitmarkCore.base58ToCore(seedString);
    let network = networkUtil.extractNetworkFromCore(core);

    return new Seed({
        _core: core,
        _string: seedString,
        _network: network
    });
};

Seed.fromCore = function (core, network) {
    assert.parameter(Buffer.isBuffer(core), 'core should be a buffer');
    assert.parameter(core.length === BITMARK_CONFIG.core.length, `core length should be ${BITMARK_CONFIG.core.length}`);

    return new Seed({
        _core: core,
        _string: bitmarkCore.exportToBase58(core),
        _network: network
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


module.exports = Seed;
