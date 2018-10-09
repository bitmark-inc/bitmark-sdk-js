'use strict';
const NETWORKS_CONFIG = require('../config/network-config');
const SDKError = require('./sdk-error');

const extractNetworkFromCore = function (core) {
    let network;
    let mode = core[0] & 0x80 | core[1] & 0x40 | core[2] & 0x20 | core[3] & 0x10;

    if (mode == (core[15] & 0xf0)) {
        network = NETWORKS_CONFIG.livenet.name;
    } else if (mode == (core[15] & 0xf0 ^ 0xf0)) {
        network = NETWORKS_CONFIG.testnet.name;
    } else {
        throw SDKError.invalidParameter('unrecognized network value');
    }

    return network;
};

const injectNetworkIntoCore = function (core, network) {
    let mode = core[0] & 0x80 | core[1] & 0x40 | core[2] & 0x20 | core[3] & 0x10;

    if (network == NETWORKS_CONFIG.testnet.name) {
        mode = mode ^ 0xf0;
    }

    core[15] = mode | core[15] & 0x0f;

    return core;
};


module.exports = {
    injectNetworkIntoCore,
    extractNetworkFromCore
};
