'use strict';
const nacl = require('tweetnacl-nodewrap');

const assert = require('../../../util/assert.js');
const ed25519Info = require('../../../config/bitmark-config').key.type.ed25519;

let _checkPriKeyLength = function (priKey) {
    assert(priKey.length === ed25519Info.prikey_length, ed25519Info.name + ' private key must be ' + ed25519Info.prikey_length + ' bytes');
};

let _checkPubKeyLength = function (pubKey) {
    assert(pubKey.length === ed25519Info.pubkey_length, ed25519Info.name + ' public key must be ' + ed25519Info.public_length + ' bytes');
};

let _checkSeedLength = function (seed) {
    assert(seed.length === ed25519Info.seed_length, ed25519Info.name + ' seed must be ' + ed25519Info.seed_length + ' bytes');
};

let generateKeyPair = function () {
    let keyPair = nacl.sign.keyPair();
    return {
        pubKey: keyPair.publicKey,
        priKey: keyPair.secretKey
    };
};

let generateKeyPairFromSeed = function (seed) {
    _checkSeedLength(seed);
    let keyPair = nacl.sign.keyPair.fromSeed(seed);
    return {
        pubKey: keyPair.publicKey,
        priKey: keyPair.secretKey
    };
};

let getSeedFromPriKey = function (priKey) {
    _checkPriKeyLength(priKey);
    return priKey.slice(0, ed25519Info.seed_length);
};

let generateKeyPairFromPriKey = function (priKey) {
    _checkPriKeyLength(priKey);
    let keyPair = nacl.sign.keyPair.fromSecretKey(priKey);
    return {
        pubKey: keyPair.publicKey,
        priKey: priKey
    };
};

let getSignature = function (message, priKey) {
    _checkPriKeyLength(priKey);
    let signature = nacl.sign.detached(message, priKey);
    return signature;
};

let verifySignature = function(pubkey, message, signature) {
    _checkPubKeyLength(pubkey);
    return nacl.sign.detached.verify(message, signature, pubkey);
}

module.exports = {
    generateKeyPair: generateKeyPair,
    generateKeyPairFromPriKey: generateKeyPairFromPriKey,
    generateKeyPairFromSeed: generateKeyPairFromSeed,
    getSeedFromPriKey: getSeedFromPriKey,
    sign: getSignature,
    verify: verifySignature
};
