'use strict';
const _ = require('lodash');

const assert = require('../util/assert');
const SDKError = require('../util/sdk-error');
const TransactionQueryBuilder = require('../model/query-builder/transaction-query-builder');
const apiService = require('../service/api-service');

const TRANSACTION_API_NAME = 'txs';
const TRANSACTION_API_METHOD = 'get';

// CONSTRUCTOR
let Transaction = function () {
    throw SDKError.operationFobidden('Can not construct Transaction object');
};


// STATIC METHODS
Transaction.newTransactionQueryBuilder = function () {
    return new TransactionQueryBuilder();
};

Transaction.get = async function (txId) {
    assert.parameter(_.isString(txId), 'Tx Id must be a string');

    let response = await apiService.sendRequest({
        method: TRANSACTION_API_METHOD,
        url: `${TRANSACTION_API_NAME}/${txId}`,
        params: {asset: false, pending: true}
    });

    return response;
};

Transaction.getWithAsset = async function (txId) {
    assert.parameter(_.isString(txId), 'Tx Id must be a string');

    let response = await apiService.sendRequest({
        method: TRANSACTION_API_METHOD,
        url: `${TRANSACTION_API_NAME}/${txId}`,
        params: {asset: true, pending: true}
    });

    return response;
};

Transaction.list = async function (transactionQueryParams) {
    assert.parameter(transactionQueryParams, 'Transaction Query Params is required');

    let response = await apiService.sendRequest({
        method: TRANSACTION_API_METHOD,
        url: TRANSACTION_API_NAME,
        params: transactionQueryParams
    });

    return response;
};


module.exports = Transaction;
