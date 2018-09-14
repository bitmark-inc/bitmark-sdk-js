'use strict';
const _ = require('lodash');

const assert = require('../util/assert');
const SDKError = require('../util/sdk-error');
const RegistrationParams = require('../model/params/registration-params');
const AssetQueryBuilder = require('../model/query-builder/asset-query-builder');
const apiService = require('../service/api-service');

const REGISTER_ASSET_API_NAME = 'register-asset';
const REGISTER_ASSET_API_METHOD = 'post';

const GET_ASSET_API_NAME = 'assets';
const GET_ASSET_API_METHOD = 'get';


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

    let response = await apiService.sendRequest({method: REGISTER_ASSET_API_METHOD, url: REGISTER_ASSET_API_NAME, params: requestBody});
    return response;
};

Asset.get = async function (assetId) {
    assert.parameter(_.isString(assetId), 'Asset Id must be a string');

    let response = await apiService.sendRequest({
        method: GET_ASSET_API_METHOD,
        url: `${GET_ASSET_API_NAME}/${assetId}`
    });
    return response;
};

Asset.newAssetQueryBuilder = function () {
    return new AssetQueryBuilder();
};

Asset.list = async function (assetQueryParams) {
    assert.parameter(assetQueryParams, 'Asset Query Params is required');

    let response = await apiService.sendRequest({
        method: GET_ASSET_API_METHOD,
        url: GET_ASSET_API_NAME,
        params: assetQueryParams
    });
    return response;
};


module.exports = Asset;
