'use strict';
const _ = require('lodash');

const BITMARK_CONFIG = require('../../config/bitmark-config');
const assert = require('../../util/assert');
const varint = require('../../util/varint');
const binary = require('../../util/binary');
const Bitmark = require('../../core/bitmark');
const Account = require('../../core/account');


// CONSTRUCTOR
let TransferParams = function (receiverAccountNumber) {
    assert(_.isString(receiverAccountNumber), 'Receiver Account Number is required');
    this.receiverAccountNumber = receiverAccountNumber;
};


// PROTOTYPE METHODS
TransferParams.prototype.fromBitmark = async function (bitmarkId) {
    let bitmark = (await Bitmark.get(bitmarkId)).bitmark;
    this.link = bitmark.head_id;
};

TransferParams.prototype.fromLatestTxId = function (latestTxId) {
    this.link = latestTxId;
};

TransferParams.prototype.sign = function (account) {
    let packagedParamsBuffer;
    packagedParamsBuffer = varint.encode(BITMARK_CONFIG.record.transfer.value);
    packagedParamsBuffer = binary.appendBuffer(packagedParamsBuffer, new Buffer(this.link, 'hex'));
    packagedParamsBuffer = Buffer.concat([packagedParamsBuffer, new Buffer([0x00])]);
    packagedParamsBuffer = binary.appendBuffer(packagedParamsBuffer, Account.packagePublicKeyFromAccountNumber(this.receiverAccountNumber));

    this.signature = account.sign(packagedParamsBuffer);
};

TransferParams.prototype.toJSON = function () {
    assert(this.signature, 'Need to sign the record before getting JSON format');
    let result = {
        transfer: {
            owner: this.receiverAccountNumber,
            signature: this.signature.toString('hex'),
            link: this.link
        }
    };

    return result;
};


module.exports = TransferParams;
