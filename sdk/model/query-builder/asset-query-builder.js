'use strict';
const _ = require('lodash');

const assert = require('../../util/assert');
const CONSTANTS = require('../../constant/constants');


// CONSTRUCTOR
let AssetQueryBuilder = function () {
    this.params = {
        pending: true
    };
};


// PROTOTYPE METHODS
AssetQueryBuilder.prototype.registeredBy = function (accountNumber) {
    assert(_.isString(accountNumber), 'Account Number must be a string');
    this.params.registrant = accountNumber;
    return this;
};

AssetQueryBuilder.prototype.assetIds = function (assetIds) {
    assert(_.isArray(assetIds), 'Asset Ids must be an array');
    this.params.asset_ids = assetIds;
    return this;
};

AssetQueryBuilder.prototype.pending = function (isPending) {
    assert(_.isBoolean(isPending), 'Pending must be boolean');
    this.params.pending = isPending;
    return this;
};

AssetQueryBuilder.prototype.limit = function (limit) {
    assert(_.isNumber(parseInt(limit)), 'Limit must be a number');
    this.params.limit = limit;
    return this;
};

AssetQueryBuilder.prototype.at = function (at) {
    assert(_.isNumber(parseInt(at)), 'At must be a number');
    this.params.at = at;
    return this;
};

AssetQueryBuilder.prototype.to = function (to) {
    assert((to === CONSTANTS.QUERY_TO_DIRECTIONS.EARLIER || to === CONSTANTS.QUERY_TO_DIRECTIONS.LATER), `To must be ${CONSTANTS.QUERY_TO_DIRECTIONS.EARLIER} or ${CONSTANTS.QUERY_TO_DIRECTIONS.LATER}`);
    this.params.to = to;
    return this;
};

AssetQueryBuilder.prototype.build = function () {
    return this.params;
};


module.exports = AssetQueryBuilder;
