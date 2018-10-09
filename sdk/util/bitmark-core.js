'use strict';
const shake256 = require('js-sha3').shake256;
const BigInteger = require('bn.js');
const _ = require('lodash');

const BITMARK_CONFIG = require('../config/bitmark-config');
const NETWORKS_CONFIG = require('../config/network-config');
const SDKError = require('./sdk-error');
const varint = require('./varint');
const common = require('./common');
const base58 = require('./base58');
const networkUtil = require('./network');
const assert = require('./assert');


const generateSeedKeysFromCore = function (core, keyCount, keySize) {
    assert.parameter(core && Buffer.isBuffer(core) && core.length === BITMARK_CONFIG.core.length, 'unrecognized core');

    // add the seed 4 times to hash value
    let hash = shake256.create(keySize * 8 * keyCount);
    for (let i = 0; i < 4; i++) {
        hash.update(core);
    }

    let hashed = hash.hex();
    assert.parameter(hashed.length == (keySize * 2 * keyCount), `Can not generate right keys`);

    // Split hashed into {keyCount} equal pieces
    // Ex:
    // "1234567890".match(/.{1,2}/g);
    // Results in:
    // ["12", "34", "56", "78", "90"]
    let seedKeys = hashed.match(new RegExp('.{1,' + (keySize * 2) + '}', 'g'));

    // Convert hex to buffer
    seedKeys.map(key => Buffer.from(key, 'hex'));

    return seedKeys;
};

const generateCore = function (network) {
    assert(network, 'Network is required');

    // 128 bit random number
    let randomBytes = common.generateRandomBytesByLength(BITMARK_CONFIG.core.number_of_random_bytes);

    // extend to 132 bits
    let core = Buffer.concat([randomBytes, Buffer.from([randomBytes[15] & 0xf0])]);

    core = networkUtil.injectNetworkIntoCore(core, network);

    return core;
};

const coreToSeedKey = function (core, keyCount = 1) {
    assert.parameter(core.length == BITMARK_CONFIG.core.length, `toSeed: expected: 16.5 bytes, actual: ${core.length}`);
    assert.parameter((core[16] & 0x0f) == 0, `unrecognized core`);

    let network = networkUtil.extractNetworkFromCore(core);

    // zero count just returns network
    if (0 == keyCount) {
        return network;
    }

    let seeds = generateSeedKeysFromCore(core, keyCount, BITMARK_CONFIG.seed.length);
    let seedKey = {seed: keyCount == 1 ? seeds[0] : seeds, network};

    return seedKey;
};

const packagePublicKey = function (network, publicKey) {
    const networkConfig = NETWORKS_CONFIG[network];
    let keyType = BITMARK_CONFIG.key.type.ed25519;
    let keyTypeVal = new BigInteger(keyType.value);
    let keyVariantVal = keyTypeVal.shln(4); // for key type from bit 5 -> 7

    keyVariantVal.ior(new BigInteger(BITMARK_CONFIG.key.part.public_key.toString())); // first bit indicates account number/auth key
    keyVariantVal.ior(new BigInteger(networkConfig.account_number_value).ishln(1)); // second bit indicates net

    let keyVariantBuffer = varint.encode(keyVariantVal);
    return Buffer.concat([keyVariantBuffer, publicKey], keyVariantBuffer.length + publicKey.length);
};

const masks = [new BigInteger('0'), new BigInteger('1'), new BigInteger('3'), new BigInteger('7'), new BigInteger('15'), new BigInteger('31'), new BigInteger('63'), new BigInteger('127'), new BigInteger('255'), new BigInteger('511'), new BigInteger('1023')];

const exportTo12Words = function (core, lang = 'en') {
    assert.parameter(core && Buffer.isBuffer(core) && core.length === BITMARK_CONFIG.core.length, 'unrecognized core');
    assert.parameter((core[16] & 0x0f) == 0, 'unrecognized core');
    assert.parameter((lang == 'en' || lang == 'cn'), `The language "${lang}" is not supported`);

    const bip39 = require(`../config/bip39/bip39_${lang}`).words;
    let phrase = [];
    let accumulator = new BigInteger('0');
    let bits = 0;
    for (let i = 0, length = core.length; i < length; i++) {
        accumulator.ishln(8).iadd(new BigInteger(core[i].toString()));
        bits += 8;
        if (bits >= 11) {
            bits -= 11; // [ 11 bits] [offset bits]

            let index = accumulator.shrn(bits).toNumber();
            accumulator.iand(masks[bits]);
            let word = bip39[index];
            phrase.push(word);
        }
    }
    return phrase;
};

const parse12Words = function (words, lang = 'en') {
    assert.parameter(_.isArray(words), 'words must be an array');
    assert.parameter(words.length === 12, 'words array must be 12 elements');
    assert.parameter((lang == 'en' || lang == 'cn'), `The language "${lang}" is not supported`);

    let bytes = [];
    let remainder = new BigInteger('0');
    let bits = 0;
    const bip39 = require(`../config/bip39/bip39_${lang}`).words;

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

    let buffer = Buffer.from(bytes);

    // check that the whole 16 bytes are converted and the final nibble remains to be packed
    assert.parameter(4 == bits && buffer.length === 16, `only get ${buffer.length} bytes from words, expected: 16.5`);

    // justify final 4 bits to high nibble, low nibble is zero
    let core = Buffer.concat([buffer, remainder.ishln(4).toBuffer()]);

    return core;
};

const exportToBase58 = function (core) {
    assert.parameter(core && Buffer.isBuffer(core) && core.length === BITMARK_CONFIG.core.length, 'unrecognized core');

    let exportedSeed = Buffer.concat([BITMARK_CONFIG.seed.header, core]);
    let checksum = common.sha3_256(exportedSeed).slice(0, BITMARK_CONFIG.seed.checksum_length);
    exportedSeed = Buffer.concat([exportedSeed, checksum]);
    return base58.encode(exportedSeed);
};

const base58ToCore = function (seedString) {
    let seedStringBuffer, headerAndCore;
    try {
        seedStringBuffer = base58.decode(seedString);
    } catch (error) {
        throw SDKError.invalidParameter('seed string is not in base58 format');
    }

    // Verify checksum
    let checksum, checksumVerification;
    checksum = seedStringBuffer.slice(seedStringBuffer.length - BITMARK_CONFIG.seed.checksum_length, seedStringBuffer.length);
    headerAndCore = seedStringBuffer.slice(0, seedStringBuffer.length - BITMARK_CONFIG.seed.checksum_length);
    checksumVerification = common.sha3_256(headerAndCore);
    checksumVerification = checksumVerification.slice(0, BITMARK_CONFIG.seed.checksum_length);
    assert.parameter(common.bufferEqual(checksum, checksumVerification), 'wrong checksum for given seed');

    let core = headerAndCore.slice(BITMARK_CONFIG.seed.header.length);
    assert.parameter(core.length === BITMARK_CONFIG.core.length, 'wrong core length');

    return core;
};

module.exports = {
    generateCore,
    coreToSeedKey,
    generateSeedKeysFromCore,
    packagePublicKey,
    exportTo12Words,
    parse12Words,
    exportToBase58,
    base58ToCore
};
