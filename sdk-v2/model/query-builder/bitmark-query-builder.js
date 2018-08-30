'use strict';
const _ = require('lodash');

const assert = require('../../util/assert');
const CONSTANTS = require('../../constant/constants');

// CONSTRUCTOR
let BitmarkQueryBuilder = function () {
    this.params = {};
};

// PROTOTYPE METHODS
BitmarkQueryBuilder.prototype.owner = function (owner) {
    assert(_.isString(owner), 'Owner must be a string');
    this.params.owner = owner;
    return this;
};

// TODO: Will remove if new API support user query by status
BitmarkQueryBuilder.prototype.pending = function (isPending) {
    assert(_.isBoolean(isPending), 'Pending must be boolean');
    this.params.pending = isPending;
    return this;
};

BitmarkQueryBuilder.prototype.status = function (status) {
    assert(CONSTANTS.BITMARK_STATUSES.includes(status), 'Status is not supported');
    this.params.status = status;
    return this;
};

BitmarkQueryBuilder.prototype.build = function () {
    return this.params;
};


module.exports = BitmarkQueryBuilder;
