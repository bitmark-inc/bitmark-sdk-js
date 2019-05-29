'use strict';
const _ = require('lodash');

const assert = require('../util/assert');
const SDKError = require('../util/sdk-error');
const IssuanceParams = require('../model/params/issuance-params');
const BitmarkQueryBuilder = require('../model/query-builder/bitmark-query-builder');
const apiService = require('../service/api-service');
const Asset = require('./asset');

const ISSUE_API_NAME = 'issue';
const ISSUE_API_METHOD = 'post';

const BITMARK_GET_API_NAME = 'bitmarks';
const BITMARK_GET_API_METHOD = 'get';

const TRANSFER_API_NAME = 'transfer';
const TRANSFER_API_METHOD = 'post';

const TRANSFER_OFFER_ACTION = 'updateOffer';
const SEND_TRANSFER_OFFER_API_METHOD = 'post';
const RESPONSE_TRANSFER_OFFER_API_METHOD = 'patch';


// CONSTRUCTOR
let Bitmark = function () {
    throw SDKError.operationFobidden('Can not construct Bitmark object');
};


// STATIC METHODS
// Issue Bitmark
Bitmark.newIssuanceParams = function (assetId, param) {
    return new IssuanceParams(assetId, param);
};

Bitmark.issue = async function (issuanceParams) {
    assert.parameter(issuanceParams instanceof IssuanceParams, `Issuance Params is not valid`);

    let assetResponse = await Asset.get(issuanceParams.assetId);
    if (assetResponse.asset && assetResponse.asset.status !== 'confirmed') {
        issuanceParams.nonces = issuanceParams.noncesStartWithZero;
        issuanceParams.signatures = issuanceParams.signaturesWithZeroNonce;
    }

    let requestBody = {};
    requestBody.issues = issuanceParams.toJSON();

    let response = await apiService.sendRequest({method: ISSUE_API_METHOD, url: ISSUE_API_NAME, params: requestBody});
    return response;
};

// Transfer 1 signature
Bitmark.newTransferParams = function (receiverAccountNumber) {
    const TransferParams = require('../model/params/transfer-params');
    return new TransferParams(receiverAccountNumber);
};

Bitmark.transfer = async function (transferParams) {
    const TransferParams = require('../model/params/transfer-params');
    assert.parameter(transferParams instanceof TransferParams, `Transfer Params is not valid`);

    let requestBody = transferParams.toJSON();
    let response = await apiService.sendRequest({
        method: TRANSFER_API_METHOD,
        url: TRANSFER_API_NAME,
        params: requestBody
    });
    return response;
};

// Transfer 2 signatures
Bitmark.newTransferOfferParams = function (receiverAccountNumber) {
    const TransferOfferParams = require('../model/params/transfer-offer-params');
    return new TransferOfferParams(receiverAccountNumber);
};

Bitmark.offer = async function (transferOfferParams) {
    const TransferOfferParams = require('../model/params/transfer-offer-params');
    assert.parameter(transferOfferParams instanceof TransferOfferParams, `Transfer Offer Params is not valid`);

    let requestBody = transferOfferParams.toJSON();
    let response = await apiService.sendRequest({
        method: SEND_TRANSFER_OFFER_API_METHOD,
        url: TRANSFER_API_NAME,
        params: requestBody
    });
    return response;
};

Bitmark.newTransferResponseParams = function (responseType) {
    const TransferResponseParams = require('../model/params/transfer-response-params');
    return new TransferResponseParams(responseType);
};

Bitmark.respond = async function (transferOfferResponseParams, account) {
    const TransferOfferResponseParams = require('../model/params/transfer-response-params');
    assert.parameter(transferOfferResponseParams instanceof TransferOfferResponseParams, `Transfer Offer Response Params is not valid`);

    let requestBody = transferOfferResponseParams.toJSON();
    let resource = requestBody.id;
    let timestamp = Date.now().toString();

    let message = [TRANSFER_OFFER_ACTION, resource, account.getAccountNumber(), timestamp].join('|');
    let signature = account.sign(message).toString('hex');

    let headers = {
        requester: account.getAccountNumber(),
        timestamp: timestamp,
        signature: signature
    };

    let response = await apiService.sendRequest({
        method: RESPONSE_TRANSFER_OFFER_API_METHOD,
        url: TRANSFER_API_NAME,
        params: requestBody,
        headers
    });
    return response;
};

// Query Bitmark
Bitmark.get = async function (bitmarkId) {
    assert.parameter(_.isString(bitmarkId), 'Bitmark Id must be a string');

    let response = await apiService.sendRequest({
        method: BITMARK_GET_API_METHOD,
        url: `${BITMARK_GET_API_NAME}/${bitmarkId}`,
        params: {asset: false, pending: true}
    });
    return response;
};

Bitmark.getWithAsset = async function (bitmarkId) {
    assert.parameter(_.isString(bitmarkId), 'Bitmark Id must be a string');

    let response = await apiService.sendRequest({
        method: BITMARK_GET_API_METHOD,
        url: `${BITMARK_GET_API_NAME}/${bitmarkId}`,
        params: {asset: true, pending: true}
    });
    return response;
};

Bitmark.newBitmarkQueryBuilder = function () {
    return new BitmarkQueryBuilder();
};

Bitmark.list = async function (bitmarkQueryParams) {
    assert.parameter(bitmarkQueryParams, 'Bitmark Query Params is required');

    let response = await apiService.sendRequest({
        method: BITMARK_GET_API_METHOD,
        url: BITMARK_GET_API_NAME,
        params: bitmarkQueryParams
    });
    return response;
};


module.exports = Bitmark;
