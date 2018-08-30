'use strict';
const _ = require('lodash');

const assert = require('../util/assert');
const SDKError = require('../util/sdk-error');
const IssuanceParams = require('../model/params/issuance-params');
const BitmarkQueryBuilder = require('../model/query-builder/bitmark-query-builder');
const apiService = require('../service/api-service');

const ISSUE_API_NAME = 'issue';
const ISSUE_API_METHOD = 'post';

const GET_API_NAME = 'bitmarks';
const GET_API_METHOD = 'get';

const TRANSFER_API_NAME = 'transfer';
const TRANSFER_API_METHOD = 'post';

let Bitmark = function () {
    throw SDKError.operationFobidden('Can not construct Bitmark object');
};

// STATIC METHODS
Bitmark.newIssuanceParams = function (assetId, param) {
    return new IssuanceParams(assetId, param);
};

Bitmark.issue = async function (issuanceParams) {
    assert.parameter(issuanceParams instanceof IssuanceParams, `Issuance Params is not valid`);

    let requestBody = {};
    requestBody.issues = issuanceParams.toJSON();

    let response = await apiService.sendRequest({method: ISSUE_API_METHOD, url: ISSUE_API_NAME, params: requestBody});
    return response;
};

Bitmark.newTransferParams = function (receiverAccountNumber) {
    const TransferParams = require('../model/params/transfer-params');
    return new TransferParams(receiverAccountNumber);
};

Bitmark.transfer = async function (transferParams) {
    const TransferParams = require('../model/params/transfer-params');
    assert.parameter(transferParams instanceof TransferParams, `Transfer Params is not valid`);

    let requestBody = {transfer: transferParams.toJSON()};
    let response = await apiService.sendRequest({method: TRANSFER_API_METHOD, url: TRANSFER_API_NAME, params: requestBody});
    return response;
};

Bitmark.get = async function (bitmarkId, options) {
    assert.parameter(_.isString(bitmarkId), 'Bitmark Id must be a string');

    let response = await apiService.sendRequest({method: GET_API_METHOD, url: `${GET_API_NAME}/${bitmarkId}`, params: options});
    return response.bitmark;
};

Bitmark.newBitmarkQueryBuilder = function () {
    return new BitmarkQueryBuilder();
};

Bitmark.list = async function (bitmarkQueryParams) {
    assert.parameter(bitmarkQueryParams, 'Bitmark Query Params is required');

    let response = await apiService.sendRequest({method: GET_API_METHOD, url: `${GET_API_NAME}`, params: bitmarkQueryParams});
    return response;
};

module.exports = Bitmark;
