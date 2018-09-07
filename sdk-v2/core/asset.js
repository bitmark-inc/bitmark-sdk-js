'use strict';
const _ = require('lodash');

const assert = require('../util/assert');
const SDKError = require('../util/sdk-error');
const RegistrationParams = require('../model/params/registration-params');
const apiService = require('../service/api-service');

const API_NAME = 'registerAsset';
const API_METHOD = 'post';


// CONSTRUCTOR
let Asset = function () {
    throw SDKError.operationFobidden('Can not construct Asset object');
};


// STATIC METHODS
Asset.newRegistrationParams = function (assetName, metadata) {
    return new RegistrationParams(assetName, metadata);
};

Asset.register = async function (registrationParams) {
    assert.parameter((registrationParams instanceof RegistrationParams), `Registration Params is not valid`);

    let requestBody = {};
    requestBody.assets = [registrationParams.toJSON()];

    let response = await apiService.sendRequest({method: API_METHOD, url: API_NAME, params: requestBody});
    return response;
};


module.exports = Asset;
