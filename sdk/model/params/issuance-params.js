'use strict';
const _ = require('lodash');

const assert = require('../../util/assert');
const common = require('../../util/common');
const varint = require('../../util/varint');
const binary = require('../../util/binary');
const SDKError = require('../../util/sdk-error');
const BITMARK_CONFIG = require('../../config/bitmark-config');
const CONSTANTS = require('../../constant/constants');


// CONSTRUCTOR
let IssuanceParams = function (assetId, param) {
    assert.parameter(_.isString(assetId), 'Asset Id must be a string');
    assert.parameter(param !== undefined, 'Param is required');
    assert(isValidNumberOfBitmarks(param), `The number of bitmarks must be greater than 1 and less than or equal ${CONSTANTS.ISSUE_BATCH_QUANTITY}`);

    this.assetId = assetId;

    if (_.isNumber(param)) {
        this.quantity = param;
    } else if (param instanceof Array) {
        this.nonces = param;
    } else {
        throw SDKError.invalidParameter('invalid param');
    }
};


// PROTOTYPE METHODS
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
            asset_id: this.assetId,
            nonce: this.nonces[i]
        };

        results.push(result);
    }

    return results;
};


// INTERNAL METHODS
function isValidNumberOfBitmarks(param) {
    let quality = 0;

    if (_.isNumber(param)) {
        quality = param;
    } else if (param instanceof Array) {
        quality = param.length;
    }

    return quality > 0 && quality <= CONSTANTS.ISSUE_BATCH_QUANTITY;
}


module.exports = IssuanceParams;
