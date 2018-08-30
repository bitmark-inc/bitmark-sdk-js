'use strict';
const _ = require('lodash');

const assert = require('../util/assert');
const SDKError = require('../util/sdk-error');
const RegistrationParams = require('../model/params/registration-params');
const IssuanceParams = require('../model/params/issuance-params');
const apiService = require('../service/api-service');

const API_NAME = 'issue';
const API_METHOD = 'post';

let Asset = function () {
    throw SDKError.operationFobidden('Can not construct Asset object');
};

// STATIC METHODS
Asset.newRegistrationParams = function (assetName, metadata) {
    return new RegistrationParams(assetName, metadata);
};

Asset.register = async function (registrationParams, issuanceParams) {
    assert.parameter((registrationParams instanceof RegistrationParams), `Registration Params is not valid`);
    assert.parameter(!issuanceParams || (issuanceParams instanceof IssuanceParams), `Issuance Params is not valid`);

    let requestBody = {};
    requestBody.assets = [registrationParams.toJSON()];

    // TODO: Will remove if API support user register asset without issue at least 1 bitmark
    if (issuanceParams) {
        requestBody.issues = issuanceParams.toJSON();
    }

    let response = await apiService.sendRequest({method: API_METHOD, url: API_NAME, params: requestBody});
    return response;
};

module.exports = Asset;
