'use strict';
const _ = require('lodash');

const BITMARK_CONFIG = require('../../config/bitmark-config');
const assert = require('../../util/assert');
const bitmarkCore = require('../../util/bitmark-core');
const networkUtil = require('../../util/network');


// CONSTRUCTOR
function RecoveryPhrase(recoveryPhraseInfo) {
    assert.parameter(recoveryPhraseInfo, 'Recovery Phrase info is required');
    Object.assign(this, recoveryPhraseInfo);
}


// STATIC METHODS
RecoveryPhrase.fromCore = RecoveryPhrase.fromBuffer = function (core, network, lang) {
    assert.parameter(Buffer.isBuffer(core), 'core is not an instance of Buffer object');
    assert.parameter(core.length === BITMARK_CONFIG.core.length, 'core must be 16.5 bytes');
    assert.parameter(network, 'network is required');

    let info = {
        _network: network,
        _core: core,
        _words: bitmarkCore.exportTo12Words(core, lang)
    };
    return new RecoveryPhrase(info);
};

RecoveryPhrase.fromString = function (phrase, lang) {
    assert.parameter(_.isString(phrase), new TypeError('Recovery Phrase error: Expect ' + phrase + ' to be a string'));
    phrase = phrase.replace(/\s\s/g, ' ');

    let words = phrase.split(' ');
    let core = bitmarkCore.parse12Words(words, lang);
    let network = networkUtil.extractNetworkFromCore(core);

    return new RecoveryPhrase({
        _core: core,
        _network: network,
        _words: words
    });
};


// PROTOTYPE METHODS
RecoveryPhrase.prototype.toString = function () {
    return this._words.join(' ');
};

RecoveryPhrase.prototype.toWords = function () {
    return this._words;
};

RecoveryPhrase.prototype.getNetwork = function () {
    return this._network;
};

RecoveryPhrase.prototype.getCore = function () {
    return this._core;
};


module.exports = RecoveryPhrase;
