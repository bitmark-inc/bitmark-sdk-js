'use strict';
const _ = require('lodash');

const assert = require('../util/assert');
const SDKError = require('../util/sdk-error');
const IssuanceParams = require('../model/params/issuance-params');
const apiService = require('../service/api-service');

const API_NAME = 'issue';
const API_METHOD = 'bitmarks';

let Bitmark = function () {
    throw SDKError.operationFobidden('Can not construct Bitmark object');
};

// STATIC METHODS
Bitmark.newIssuanceParams = function (assetId, param) {
    assert.parameter(_.isString(assetId), `Asset Id must be a string`);
    assert.parameter(param !== undefined, `Param is required`);

    return new IssuanceParams(assetId, param);
};

module.exports = Bitmark;
