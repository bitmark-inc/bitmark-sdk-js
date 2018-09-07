'use strict';
const sha3_256 = require('js-sha3').sha3_256;
const sha3_512 = require('js-sha3').sha3_512;
const nacl = require('tweetnacl-nodewrap');
const BigInteger = require('bn.js');
const _ = require('lodash');

const BITMARK_CONFIG = require('../config/bitmark-config');
const assert = require('./assert.js');

let getKeyTypeByValue = function (value) {
    let typeName, typeValue;

    if (!(value instanceof BigInteger)) {
        value = new BigInteger(value);
    }
    for (typeName in BITMARK_CONFIG.key.type) {
        typeValue = BITMARK_CONFIG.key.type[typeName].value;
        if (value.eq(new BigInteger(typeValue))) {
            return BITMARK_CONFIG.key.type[typeName];
        }
    }
    return null;
};

let bufferEqual = function (bufferA, bufferB) {
    if (bufferA.length !== bufferB.length) {
        return false;
    }

    let length = bufferA.length;
    for (let i = 0; i < length; i++) {
        if (bufferA[i] !== bufferB[i]) {
            return false;
        }
    }
    return true;
};

let normalizeStr = function (str) {
    return _.isString(str) && str.normalize ? str.normalize() : str;
};

let getSHA3_256 = function (buffer) {
    let resultInArrayBuffer = sha3_256.buffer(buffer);
    let resultInBuffer = new Buffer(resultInArrayBuffer);
    return resultInBuffer;
};

let getSHA3_512 = function (buffer) {
    let resultInArrayBuffer = sha3_512.buffer(buffer);
    let resultInBuffer = new Buffer(resultInArrayBuffer);
    return resultInBuffer;
};

let createSHA3_512Stream = function () {
    let hash = sha3_512.create();
    return {
        update: function (data) {
            hash.update(data);
        },
        buffer: function () {
            return hash.buffer();
        },
        hex: function () {
            return hash.hex();
        }
    }
};

let generateRandomBytesByLength = function (length) {
    return nacl.randomBytes(length);
};

let addImmutableProperties = function (target, properties) {
    Object.keys(properties).forEach(function (key) {
        Object.defineProperty(target, key, {
            configurable: false,
            enumerable: true,
            value: properties[key]
        });
    });
    return target;
};

let makeSureSDKInitialized = function () {
    const sdkConfig = global.getSDKConfig();
    assert.parameter(sdkConfig, `SDK is not initialized yet`);
    assert.parameter(sdkConfig.network, `Global network is not defined`);
    assert.parameter(sdkConfig.apiToken, `API Token is not defined`);
};

let generateRandomInteger = function (min = 1, max = Number.MAX_SAFE_INTEGER) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

let mapToMetadataString = function (map) {
    let metadataSeparator = String.fromCharCode(parseInt('\u0000', 16));

    let elements = [];
    for (let key in map) {
        elements.push(key, map[key]);
    }
    return elements.join(metadataSeparator);
};

let computeAssetId = function (fingerprint) {
    return getSHA3_512(new Buffer(fingerprint, 'utf8')).toString('hex');
};

module.exports = {
    getKeyTypeByValue: getKeyTypeByValue,
    generateRandomBytesByLength: generateRandomBytesByLength,
    bufferEqual: bufferEqual,
    normalizeStr: normalizeStr,
    addImmutableProperties: addImmutableProperties,
    sha3_256: getSHA3_256,
    sha3_512: getSHA3_512,
    createSHA3_512Stream: createSHA3_512Stream,
    makeSureSDKInitialized: makeSureSDKInitialized,
    generateRandomInteger: generateRandomInteger,
    mapToMetadataString: mapToMetadataString,
    computeAssetId: computeAssetId
};
