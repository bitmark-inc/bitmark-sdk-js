'use strict';

const sha3_256 = require('js-sha3').sha3_256;
const sha3_512 = require('js-sha3').sha3_512;
const nacl = require('tweetnacl-nodewrap');
const BigInteger = require('bn.js');
const _ = require('lodash');

const bitmarkConfig = require('../config/bitmark-config');

let getKeyTypeByValue = function (value) {
    let typeName, typeValue;

    if (!(value instanceof BigInteger)) {
        value = new BigInteger(value);
    }
    for (typeName in bitmarkConfig.key.type) {
        typeValue = bitmarkConfig.key.type[typeName].value;
        if (value.eq(new BigInteger(typeValue))) {
            return bitmarkConfig.key.type[typeName];
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

module.exports = {
    getKeyTypeByValue: getKeyTypeByValue,
    generateRandomBytesByLength: generateRandomBytesByLength,
    bufferEqual: bufferEqual,
    normalizeStr: normalizeStr,
    addImmutableProperties: addImmutableProperties,
    sha3_256: getSHA3_256,
    sha3_512: getSHA3_512,
    createSHA3_512Stream: createSHA3_512Stream
};
