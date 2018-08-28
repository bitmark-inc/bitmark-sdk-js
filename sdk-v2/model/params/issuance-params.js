'use strict';
const _ = require('lodash');

const assert = require('../../util/assert');
const common = require('../../util/common');
const varint = require('../../util/varint');
const binary = require('../../util/binary');
const SDKError = require('../../util/sdk-error');
const BITMARK_CONFIG = require('../../config/bitmark-config');

let IssuanceParams = function (assetId, param) {
    this.assetId = assetId;

    if (_.isNumber(param)) {
        this.quantity = param
    } else if (param instanceof Array) {
        this.nonces = param;
    } else {
        throw SDKError.invalidParameter('invalid param');
    }
};

IssuanceParams.prototype.sign = function (account) {
    if (!this.nonces) {
        this.nonces = [];
        for (let i = 0; i < this.quantity; i++) {
            this.nonces.push(common.generateRandomInteger(1, Number.MAX_SAFE_INTEGER));
        }
    }

    this.signatures = [];
    for (let i = 0; i < this.nonces.length; i++) {
        let packagedParamsBuffer;
        packagedParamsBuffer = varint.encode(BITMARK_CONFIG.record.issue.value);
        packagedParamsBuffer = binary.appendBuffer(packagedParamsBuffer, new Buffer(this.assetId, 'hex'));
        packagedParamsBuffer = binary.appendBuffer(packagedParamsBuffer, account.packagePublicKey());
        packagedParamsBuffer = Buffer.concat([packagedParamsBuffer, varint.encode(this.nonces[i])]);
        this.signatures.push(account.sign(packagedParamsBuffer));
    }

    this.owner = account.getAccountNumber();
};

IssuanceParams.prototype.toJSON = function () {
    assert(this.signatures, 'Need to sign the record before getting JSON format');
    let results = [];

    for (let i = 0; i < this.nonces.length; i++) {
        let result = {
            owner: this.owner,
            signature: this.signatures[i].toString('hex'),
            asset: this.assetId,
            nonce: this.nonces[i]
        };

        results.push(result);
    }

    return results;
};


module.exports = IssuanceParams;
