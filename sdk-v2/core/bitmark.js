'use strict';
const _ = require('lodash');

const assert = require('../util/assert');
const SDKError = require('../util/sdk-error');
const IssuanceParams = require('../model/params/issuance-params');
const apiService = require('../service/api-service');
const CONSTANTS = require('../constant/constants');

const ISSUE_API_NAME = 'issue';
const API_METHOD = 'post';

let Bitmark = function () {
    throw SDKError.operationFobidden('Can not construct Bitmark object');
};

// STATIC METHODS
Bitmark.newIssuanceParams = function (assetId, param) {
    assert.parameter(_.isString(assetId), 'Asset Id must be a string');
    assert.parameter(param !== undefined, 'Param is required');
    assert(isValidNumberOfBitmarks(param), `The number of bitmarks must be greater than 1 and less than or equal ${CONSTANTS.ISSUE_BATCH_QUANTITY}`);

    return new IssuanceParams(assetId, param);
};

Bitmark.issue = async function (issuanceParams) {
    assert.parameter(issuanceParams instanceof IssuanceParams, `Issuance Params is not valid`);

    let requestBody = {};
    requestBody.issues = issuanceParams.toJSON();

    let response = await apiService.sendRequest({method: API_METHOD, url: ISSUE_API_NAME, params: requestBody});
    return response;
};


// INTERNAL METHODS
function isValidNumberOfBitmarks(param) {
    let quality = 0;

    if (_.isNumber(param)) {
        quality = param;
    } else if (param instanceof Array) {
        quality = param.length;
    }

    return quality > 0 && quality <= CONSTANTS.ISSUE_BATCH_QUANTITY;
}

module.exports = Bitmark;
