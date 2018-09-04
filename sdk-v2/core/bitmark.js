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

const TRANSFER_OFFER_API_VERSION = 'v2';
const TRANSFER_OFFER_API_NAME = 'transfer_offers';
const TRANSFER_OFFER_ACTION = 'transferOffer';
const SEND_TRANSFER_OFFER_API_METHOD = 'post';
const GET_TRANSFER_OFFER_API_METHOD = 'get';
const RESPONSE_TRANSFER_OFFER_API_METHOD = 'patch';


// CONSTRUCTOR
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

// Transfer 1 signature
Bitmark.newTransferParams = function (receiverAccountNumber) {
    const TransferParams = require('../model/params/transfer-params');
    return new TransferParams(receiverAccountNumber);
};

Bitmark.transfer = async function (transferParams) {
    const TransferParams = require('../model/params/transfer-params');
    assert.parameter(transferParams instanceof TransferParams, `Transfer Params is not valid`);

    let requestBody = transferParams.toJSON();
    let response = await apiService.sendRequest({method: TRANSFER_API_METHOD, url: TRANSFER_API_NAME, params: requestBody});
    return response;
};

// Transfer 2 signatures
Bitmark.newTransferOfferParams = function (receiverAccountNumber) {
    const TransferOfferParams = require('../model/params/transfer-offer-params');
    return new TransferOfferParams(receiverAccountNumber);
};

Bitmark.offer = async function (transferOfferParams, account) {
    const TransferOfferParams = require('../model/params/transfer-offer-params');
    assert.parameter(transferOfferParams instanceof TransferOfferParams, `Transfer Offer Params is not valid`);

    let requestBody = transferOfferParams.toJSON();
    let resource = JSON.stringify(requestBody.record);
    let timestamp = Date.now().toString();

    let message = [TRANSFER_OFFER_ACTION, resource, requestBody.from, timestamp].join('|');
    let signature = account.sign(message).toString('hex');

    let headers = {
        requester: requestBody.from,
        timestamp: timestamp,
        signature: signature
    };

    let response = await apiService.sendRequest({
        method: SEND_TRANSFER_OFFER_API_METHOD,
        url: TRANSFER_OFFER_API_NAME,
        apiVersion: TRANSFER_OFFER_API_VERSION,
        params: requestBody,
        headers
    });
    return response;
};

Bitmark.newTransferResponseParams = function (responseType) {
    const TransferOfferResponseParams = require('../model/params/transfer-offer-response-params');
    return new TransferOfferResponseParams(responseType);
};

Bitmark.response = async function (transferOfferResponseParams, account) {
    const TransferOfferResponseParams = require('../model/params/transfer-offer-response-params');
    assert.parameter(transferOfferResponseParams instanceof TransferOfferResponseParams, `Transfer Offer Response Params is not valid`);

    let requestBody = transferOfferResponseParams.toJSON();
    let resource = "patch";
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
        url: TRANSFER_OFFER_API_NAME,
        apiVersion: TRANSFER_OFFER_API_VERSION,
        params: requestBody,
        headers
    });
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

Bitmark.getTransferOffer = async function (offerId) {
    assert.parameter(offerId, 'Offer Id is required');

    let requestBody = {offer_id: offerId};
    let response = await apiService.sendRequest({
        method: GET_TRANSFER_OFFER_API_METHOD,
        url: TRANSFER_OFFER_API_NAME,
        apiVersion: TRANSFER_OFFER_API_VERSION,
        params: requestBody
    });
    return response;
};

Bitmark.getTransferOffers = async function (accountNumber) {
    assert.parameter(accountNumber, 'Account Number is required');

    let requestBody = {requester: accountNumber};
    let response = await apiService.sendRequest({
        method: GET_TRANSFER_OFFER_API_METHOD,
        url: `${TRANSFER_OFFER_API_NAME}`,
        apiVersion: TRANSFER_OFFER_API_VERSION,
        params: requestBody
    });
    return response;
};


module.exports = Bitmark;
