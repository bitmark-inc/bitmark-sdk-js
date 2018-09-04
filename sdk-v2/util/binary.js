'use strict';
const varint = require('./varint.js');

let appendString = function (desBuffer, str, encoding) {
    encoding = encoding || 'utf8';
    let valueBuffer = str ? new Buffer(str, encoding) : new Buffer(0);
    let lengthBuffer = varint.encode(valueBuffer.length);
    let newBufferLength = desBuffer.length + lengthBuffer.length + valueBuffer.length;

    return Buffer.concat([desBuffer, lengthBuffer, valueBuffer], newBufferLength);
};

let appendBuffer = function (desBuffer, srcBuffer) {
    let lengthBuffer = varint.encode(srcBuffer.length);
    let newBufferLength = desBuffer.length + lengthBuffer.length + srcBuffer.length;

    return Buffer.concat([desBuffer, lengthBuffer, srcBuffer], newBufferLength);
};

module.exports = {
    appendString: appendString,
    appendBuffer: appendBuffer
};
