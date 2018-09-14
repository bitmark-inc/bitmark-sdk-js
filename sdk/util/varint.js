'use strict';
const BigInteger = require('bn.js');

let varintEncode = function (value) {
    // Correct the value data type to BigInteger
    if (!(value instanceof BigInteger)) {
        value = new BigInteger(value);
    }

    // Check valid value
    if (value.toBuffer().length > 8) {
        throw new Error('can not varint encode: number is too long');
    }
    if (value.isNeg()) {
        throw new Error('can not varint encode: number must be positive');
    }

    let result = new Buffer(9);
    let offsetCount = 0;
    let valueBuffer;
    let valueCompared = new BigInteger(128);

    while (value.cmp(valueCompared) >= 0) {
        valueBuffer = value.toBuffer();
        result.writeUInt8(valueBuffer.readUInt8(valueBuffer.length - 1) | 0x80, offsetCount);
        value.ishrn(7);
        offsetCount++;
    }

    if (offsetCount === 9) {
        if (value.toNumber()) {
            result.writeUInt8(result.readUInt8(8) | 0x80, 8);
            offsetCount = 8;
        }
    } else {
        result.writeUInt8(value.toNumber(), offsetCount);
    }
    return result.slice(0, offsetCount + 1);
};

let varintDecode = function (encodedBuffer) {
    // Correct the input to Buffer
    if (!Buffer.isBuffer(encodedBuffer)) {
        encodedBuffer = new Buffer(encodedBuffer);
    }

    let currentByte = 0x80;
    let result = new BigInteger(0);
    let maxLength = encodedBuffer.length > 9 ? 9 : encodedBuffer.length;
    let i, currentValue;

    for (i = 0; i < maxLength && (currentByte & 0x80) === 0x80; i++) {
        currentByte = currentValue = encodedBuffer.readUInt8(i);
        if (i < 8) {
            currentValue = currentValue & 0x7f;
        }
        currentValue = new BigInteger(currentValue);
        result.iadd(currentValue.ishln(i * 7));
    }

    return result;
};

module.exports = {
    encode: varintEncode,
    decode: varintDecode
};
