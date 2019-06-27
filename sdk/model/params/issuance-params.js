'use strict';
const _ = require('lodash');

const assert = require('../../util/assert');
const common = require('../../util/common');
const varint = require('../../util/varint');
const binary = require('../../util/binary');
const BITMARK_CONFIG = require('../../config/bitmark-config');
const CONSTANTS = require('../../constant/constants');


// CONSTRUCTOR
let IssuanceParams = function (assetId, quantity) {
    assert.parameter(_.isString(assetId), 'Asset Id must be a string');
    assert.parameter(_.isNumber(quantity), 'Quantity must be a number');
    assert(isValidNumberOfBitmarks(quantity), `The number of bitmarks must be greater than or equal 1`);

    this.assetId = assetId;
    this.quantity = quantity;
};


// PROTOTYPE METHODS
IssuanceParams.prototype.sign = function (account) {
    this.nonces = [];
    this.noncesStartWithZero = [];

    for (let i = 0; i < this.quantity; i++) {
        let randomNonce = common.generateRandomInteger(1, Number.MAX_SAFE_INTEGER);

        this.nonces.push(randomNonce);

        if (i == 0) {
            this.noncesStartWithZero.push(0);
        } else {
            this.noncesStartWithZero.push(randomNonce);
        }
    }

    const packageParams = (nonce) => {
        let packagedParamsBuffer;
        packagedParamsBuffer = varint.encode(BITMARK_CONFIG.record.issue.value);
        packagedParamsBuffer = binary.appendBuffer(packagedParamsBuffer, new Buffer(this.assetId, 'hex'));
        packagedParamsBuffer = binary.appendBuffer(packagedParamsBuffer, account.packagePublicKey());
        packagedParamsBuffer = Buffer.concat([packagedParamsBuffer, varint.encode(nonce)]);

        return packagedParamsBuffer;
    };

    this.signatures = [];
    this.signaturesWithZeroNonce = [];
    for (let i = 0; i < this.nonces.length; i++) {
        let signature = account.sign(packageParams(this.nonces[i]));
        this.signatures.push(signature);

        if (i == 0) {
            this.signaturesWithZeroNonce.push(account.sign(packageParams(this.noncesStartWithZero[0])));
        } else {
            this.signaturesWithZeroNonce.push(signature);
        }
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
function isValidNumberOfBitmarks(quantity) {
    return quantity > 0;
}


module.exports = IssuanceParams;
