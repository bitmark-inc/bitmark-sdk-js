'use strict';
const _ = require('lodash');

const assert = require('../../util/assert');
const CONSTANTS = require('../../constant/constants');


// CONSTRUCTOR
let TransactionQueryBuilder = function () {
    this.params = {};
};


// PROTOTYPE METHODS
TransactionQueryBuilder.prototype.ownedBy = function (accountNumber) {
    assert(_.isString(accountNumber), 'Account Number must be a string');
    this.params.owner = accountNumber;
    return this;
};

TransactionQueryBuilder.prototype.referencedAsset = function (assetId) {
    assert(_.isString(assetId), 'Asset Id must be a string');
    this.params.asset_id = assetId;
    return this;
};

TransactionQueryBuilder.prototype.referencedBitmark = function (bitmarkId) {
    assert(_.isString(bitmarkId), 'Bitmark Id must be a string');
    this.params.bitmark_id = bitmarkId;
    return this;
};

TransactionQueryBuilder.prototype.loadAsset = function (shouldLoadAsset) {
    assert(_.isBoolean(shouldLoadAsset), 'shouldLoadAsset must be a boolean');
    this.params.asset = shouldLoadAsset;
    return this;
};

TransactionQueryBuilder.prototype.limit = function (limit) {
    assert(_.isNumber(parseInt(limit)), 'Limit must be a number');
    this.params.limit = limit;
    return this;
};

TransactionQueryBuilder.prototype.at = function (at) {
    assert(_.isNumber(parseInt(at)), 'At must be a number');
    this.params.at = at;
    return this;
};

TransactionQueryBuilder.prototype.to = function (to) {
    assert((to === CONSTANTS.QUERY_TO_DIRECTIONS.EARLIER || to === CONSTANTS.QUERY_TO_DIRECTIONS.LATER), `To must be ${CONSTANTS.QUERY_TO_DIRECTIONS.EARLIER} or ${CONSTANTS.QUERY_TO_DIRECTIONS.LATER}`);
    this.params.to = to;
    return this;
};

TransactionQueryBuilder.prototype.build = function () {
    return this.params;
};


module.exports = TransactionQueryBuilder;
