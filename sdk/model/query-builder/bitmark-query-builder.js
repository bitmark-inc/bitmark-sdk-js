'use strict';
const _ = require('lodash');

const assert = require('../../util/assert');
const CONSTANTS = require('../../constant/constants');


// CONSTRUCTOR
let BitmarkQueryBuilder = function () {
    this.params = {
        pending: true
    };
};


// PROTOTYPE METHODS
BitmarkQueryBuilder.prototype.ownedBy = function (accountNumber) {
    assert(_.isString(accountNumber), 'Account Number must be a string');
    this.params.owner = accountNumber;
    return this;
};

BitmarkQueryBuilder.prototype.ownedByWithTransient = function (accountNumber) {
    assert(_.isString(accountNumber), 'Account Number must be a string');
    this.params.owner = accountNumber;
    this.params.sent = true;
    return this;
};

BitmarkQueryBuilder.prototype.issuedBy = function (issuer) {
    assert(_.isString(issuer), 'Issuer must be a string');
    this.params.issuer = issuer;
    return this;
};

BitmarkQueryBuilder.prototype.pending = function (isPending) {
    assert(_.isBoolean(isPending), 'Pending must be boolean');
    this.params.pending = isPending;
    return this;
};

BitmarkQueryBuilder.prototype.offerTo = function (accountNumber) {
    assert(_.isString(accountNumber), 'Account Number must be a string');
    this.params.offer_to = accountNumber;
    return this;
};

BitmarkQueryBuilder.prototype.offerFrom = function (accountNumber) {
    assert(_.isString(accountNumber), 'Account Number must be a string');
    this.params.offer_from = accountNumber;
    return this;
};

BitmarkQueryBuilder.prototype.bitmarkIds = function (bitmarkIds) {
    assert(_.isArray(bitmarkIds), 'BitmarkIds must be an array');
    this.params.bitmark_ids = bitmarkIds;
    return this;
};

BitmarkQueryBuilder.prototype.referencedAsset = function (assetId) {
    assert(_.isString(assetId), 'Asset Id must be a string');
    this.params.asset_id = assetId;
    return this;
};

BitmarkQueryBuilder.prototype.loadAsset = function (shouldLoadAsset) {
    assert(_.isBoolean(shouldLoadAsset), 'shouldLoadAsset must be a boolean');
    this.params.asset = shouldLoadAsset;
    return this;
};

BitmarkQueryBuilder.prototype.limit = function (limit) {
    assert(_.isNumber(parseInt(limit)), 'Limit must be a number');
    this.params.limit = limit;
    return this;
};

BitmarkQueryBuilder.prototype.at = function (at) {
    assert(_.isNumber(parseInt(at)), 'At must be a number');
    this.params.at = at;
    return this;
};

BitmarkQueryBuilder.prototype.to = function (to) {
    assert((to === CONSTANTS.QUERY_TO_DIRECTIONS.EARLIER || to === CONSTANTS.QUERY_TO_DIRECTIONS.LATER), `To must be ${CONSTANTS.QUERY_TO_DIRECTIONS.EARLIER} or ${CONSTANTS.QUERY_TO_DIRECTIONS.LATER}`);
    this.params.to = to;
    return this;
};

BitmarkQueryBuilder.prototype.build = function () {
    return this.params;
};


module.exports = BitmarkQueryBuilder;
