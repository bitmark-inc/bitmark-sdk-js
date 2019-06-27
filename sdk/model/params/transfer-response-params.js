'use strict';
const BITMARK_CONFIG = require('../../config/bitmark-config');
const CONSTANTS = require('../../constant/constants');
const assert = require('../../util/assert');
const varint = require('../../util/varint');
const binary = require('../../util/binary');
const Bitmark = require('../../core/bitmark');
const Account = require('../../core/account');


// CONSTRUCTOR
let TransferResponseParams = function (responseType) {
    assert(Object.values(CONSTANTS.TRANSFER_OFFER_RESPONSE_TYPES).includes(responseType), 'Response Type is not supported');
    this.responseType = responseType;
};


// PROTOTYPE METHODS
TransferResponseParams.prototype.fromBitmark = async function (bitmarkId) {
    let result = await Bitmark.get(bitmarkId);
    this.offer = result.bitmark.offer;
    assert(this.offer, 'Offer does not exist');
};

TransferResponseParams.prototype.fromOffer = function (offer) {
    this.offer = offer;
};

TransferResponseParams.prototype.sign = function (account) {
    let packagedParamsBuffer;
    packagedParamsBuffer = varint.encode(BITMARK_CONFIG.record.transfer_2_signatures.value);
    packagedParamsBuffer = binary.appendBuffer(packagedParamsBuffer, new Buffer(this.offer.record.link, 'hex'));
    packagedParamsBuffer = Buffer.concat([packagedParamsBuffer, new Buffer([0x00])]);
    packagedParamsBuffer = binary.appendBuffer(packagedParamsBuffer, Account.packagePublicKeyFromAccountNumber(this.offer.record.owner));
    packagedParamsBuffer = binary.appendBuffer(packagedParamsBuffer, new Buffer(this.offer.record.signature, 'hex'));

    this.counterSignature = account.sign(packagedParamsBuffer);
};

TransferResponseParams.prototype.toJSON = function () {
    if (this.responseType === CONSTANTS.TRANSFER_OFFER_RESPONSE_TYPES.ACCEPT) {
        assert(this.counterSignature, 'Need to sign the record before getting JSON format');
    }

    let result = {
        action: this.responseType,
        countersignature: this.responseType === CONSTANTS.TRANSFER_OFFER_RESPONSE_TYPES.ACCEPT ? this.counterSignature.toString('hex') : undefined,
        id: this.offer.id
    };

    return result;
};


module.exports = TransferResponseParams;
