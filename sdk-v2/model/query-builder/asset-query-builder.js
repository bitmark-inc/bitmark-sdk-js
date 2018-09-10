'use strict';
const _ = require('lodash');

const assert = require('../../util/assert');


// CONSTRUCTOR
let AssetQueryBuilder = function () {
    this.params = {};
};


// PROTOTYPE METHODS
AssetQueryBuilder.prototype.registeredBy = function (accountNumber) {
    assert(_.isString(accountNumber), 'Account Number must be a string');
    this.params.registrant = accountNumber;
    return this;
};

AssetQueryBuilder.prototype.limit = function (limit) {
    assert(_.isNumber(parseInt(limit)), 'Limit must be a number');
    this.params.limit = limit;
    return this;
};

AssetQueryBuilder.prototype.build = function () {
    return this.params;
};


module.exports = AssetQueryBuilder;
