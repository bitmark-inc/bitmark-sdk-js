'use strict';
const _ = require('lodash');
const fs = require('fs');

const assert = require('./assert');
const common = require('./common');

let computeFingerprintFromBuffer = function (data) {
    assert(Buffer.isBuffer(data), new TypeError('Fingerprint error: buffer is required'));
    return '01' + common.sha3_512(data).toString('hex');
};

let computeFingerprintFromString = function (data) {
    assert(_.isString(data), new TypeError('Fingerprint error: utf8 string is required'));
    return '01' + common.sha3_512(data).toString('hex');
};

let computeFingerprintFromStream = function (stream) {
    return new Promise((resolve, reject) => {
        let hasher = common.createSHA3_512Stream();
        stream.on('data', function (data) {
            hasher.update(data);
        });
        stream.on('end', function () {
            resolve('01' + hasher.hex());
        });
        stream.on('error', function (error) {
            reject(error);
        });
    });
};

let computeFingerprintFromFile = function (filepath) {
    let readStream = fs.createReadStream(filepath);
    return computeFingerprintFromStream(readStream);
};

module.exports = {
    fromBuffer: computeFingerprintFromBuffer,
    fromString: computeFingerprintFromString,
    fromStream: computeFingerprintFromStream,
    fromFile: computeFingerprintFromFile
};
