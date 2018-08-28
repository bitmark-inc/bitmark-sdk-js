'use strict';

const _ = require('lodash');
const BigInteger = require('../../../node_modules/bn.js/lib/bn');

const BITMARK_CONFIG = require('../../config/bitmark-config');
const NETWORKS_CONFIG = require('../../config/network-config');
const bip39 = require('../../config/bip39').words;

const varint = require('../../util/varint.js');
const assert = require('../../util/assert.js');


function RecoveryPhrase(recoveryPhraseInfo) {
    assert.parameter(recoveryPhraseInfo, 'Recovery Phrase info is required');
    Object.assign(this, recoveryPhraseInfo);
}

// STATIC METHODS
RecoveryPhrase.fromCore = RecoveryPhrase.fromBuffer = function (buffer, network) {
    assert.parameter(Buffer.isBuffer(buffer), 'buffer is not an instance of Buffer object');
    assert.parameter(buffer.length === 32, 'buffer must be 32 bytes');

    assert.parameter(network, 'network is required');

    let info = {
        _network: network,
        _core: buffer,
        _words: exportToWords(buffer, network)
    };
    return new RecoveryPhrase(info);
};

RecoveryPhrase.fromString = function (phrase) {
    assert.parameter(_.isString(phrase), new TypeError('Recovery Phrase error: Expect ' + phrase + ' to be a string'));
    phrase = phrase.replace(/\s\s/g, ' ');
    return new RecoveryPhrase(parseWords(phrase.split(' ')));
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

// INTERNAL METHODS
let masks = [new BigInteger('0'), new BigInteger('1'), new BigInteger('3'), new BigInteger('7'), new BigInteger('15'), new BigInteger('31'), new BigInteger('63'), new BigInteger('127'), new BigInteger('255'), new BigInteger('511'), new BigInteger('1023')];

function exportToWords(core, network) {
    assert.parameter(core && Buffer.isBuffer(core) && core.length === BITMARK_CONFIG.core.length, 'unrecognized core');
    assert.parameter(network, 'unrecognized network');

    let networkConfig = NETWORKS_CONFIG[network];
    let value = Buffer.concat([varint.encode(networkConfig.core_value), core]);

    let phrase = [];
    let accumulator = new BigInteger('0');
    let bits = 0;
    for (let i = 0, length = value.length; i < length; i++) {
        accumulator.ishln(8).iadd(new BigInteger(value[i].toString()));
        bits += 8;
        if (bits >= 11) {
            bits -= 11; // [ 11 bits] [offset bits]

            let index = accumulator.shrn(bits).toNumber();
            accumulator.iand(masks[bits]);
            phrase.push(bip39[index]);
        }
    }
    return phrase;
}

function parseWords(words) {
    assert.parameter(_.isArray(words), 'words must be an array');
    assert.parameter(words.length === 24, 'words array must be 24 elements');

    let bytes = [];
    let remainder = new BigInteger('0');
    let bits = 0;

    for (let i = 0, totalWords = words.length; i < totalWords; i++) {
        let word = words[i];
        let n = bip39.indexOf(word);

        assert.parameter(n >= 0, `unrecognized word "${word}"`);

        remainder.ishln(11).iadd(new BigInteger(n.toString()));
        for (bits += 11; bits >= 8; bits -= 8) {
            let a = (new BigInteger('ff', 16)).and(remainder.shrn(bits - 8));
            bytes.push(a.toNumber());
        }

        remainder.iand(masks[bits]);
    }

    assert.parameter(bytes.length === 33, `only get ${bytes.length} bytes from words`);

    return {
        _core: Buffer.from(bytes.slice(1)),
        _network: bytes[0] === NETWORKS_CONFIG.livenet.core_value ? NETWORKS_CONFIG.livenet.name : NETWORKS_CONFIG.testnet.name,
        _words: words
    };
}

module.exports = RecoveryPhrase;
