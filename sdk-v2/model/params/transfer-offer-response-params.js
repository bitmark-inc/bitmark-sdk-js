'use strict';
const _ = require('lodash');

const BITMARK_CONFIG = require('../../config/bitmark-config');
const CONSTANTS = require('../../constant/constants');

const assert = require('../../util/assert');
const varint = require('../../util/varint');
const binary = require('../../util/binary');
const Bitmark = require('../../core/bitmark');
const Account = require('../../core/account');


// CONSTRUCTOR
let TransferOfferResponseParams = function (responseType) {
    assert(CONSTANTS.TRANSFER_OFFER_RESPONSE_TYPES.includes(responseType), 'Response Type is not supported');
    this.responseType = responseType;
};


// PROTOTYPE METHODS
TransferOfferResponseParams.prototype.fromOffer = async function (offerId) {
    let result = await Bitmark.getTransferOffer(offerId);
    this.offer = result.offer;
};

TransferOfferResponseParams.prototype.sign = function (account) {
    let packagedParamsBuffer;
    packagedParamsBuffer = varint.encode(BITMARK_CONFIG.record.transfer_2_signatures.value);
    packagedParamsBuffer = binary.appendBuffer(packagedParamsBuffer, new Buffer(this.offer.record.link, 'hex'));
    packagedParamsBuffer = Buffer.concat([packagedParamsBuffer, new Buffer([0x00])]);
    packagedParamsBuffer = binary.appendBuffer(packagedParamsBuffer, Account.packagePublicKeyFromAccountNumber(this.offer.record.owner));
    packagedParamsBuffer = binary.appendBuffer(packagedParamsBuffer, new Buffer(this.offer.record.signature, 'hex'));

    this.counterSignature = account.sign(packagedParamsBuffer);
};

TransferOfferResponseParams.prototype.toJSON = function () {
    assert(this.counterSignature, 'Need to sign the record before getting JSON format');
    let result = {
        id: this.offer.id,
        reply: {
            action: this.responseType,
            countersignature: this.counterSignature.toString('hex')
        }
    };

    return result;
};


module.exports = TransferOfferResponseParams;
