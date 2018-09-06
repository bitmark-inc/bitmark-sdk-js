'use strict';

const axios = require('axios');
const _ = require('lodash');
const FormData = require('form-data');

const NETWORKS_CONFIG = require('../config/network-config');
const assert = require('../util/assert.js');
const common = require('../util/common');
const SDKError = require('../util/sdk-error');

let sendRequest = async (options) => {
    common.makeSureSDKInitialized();
    options = options || {};
    let method = options.method;
    let apiUrl = options.url;
    let params = options.params;
    let headers = options.headers;
    let network = NETWORKS_CONFIG[global.getSDKConfig().network];
    let apiVersion = options.apiVersion || network.api_version;

    assert(network, 'unrecognized network', SDKError.INVALID_PARAMETERS_ERROR_CODE);
    assert(apiUrl, 'missing api url', SDKError.SERVICE_FAILED);

    let url = `${network.api_server}/${apiVersion}/${apiUrl}`;
    let requestOptions = {};
    method = method.toUpperCase();
    requestOptions.method = method;
    requestOptions.url = url;

    if (method === 'GET') {
        requestOptions.params = params;
    } else if (method === 'POST') {
        requestOptions.data = params;
    } else if (method === 'PATCH') {
        requestOptions.data = params;
    } else {
        throw SDKError.invalidParameter('method is not supported');
    }

    if (headers) {
        requestOptions.headers = headers;
    }

    let response = await axios(requestOptions);
    return response.data;
};

let sendMultipartRequest = async (options) => {
    common.makeSureSDKInitialized();
    options = options || {};
    let apiUrl = options.url;
    let params = options.params;
    let headers = options.headers;
    let network = NETWORKS_CONFIG[global.getSDKConfig().network];

    assert(network, 'unrecognized network', SDKError.INVALID_PARAMETERS_ERROR_CODE);
    assert(apiUrl, 'missing api url', SDKError.SERVICE_FAILED);

    let url = `${network.api_server}/${network.api_version}/${apiUrl}`;

    let form = new FormData();
    for (let i in params) {
        form.append(i, params[i]);
    }

    let requestOptions = {
        method: 'post',
        url: url,
        data: form,
        headers: _.merge(headers, form.getHeaders())
    };

    try {
        let response = await axios(requestOptions);
        return response.data;
    } catch (error) {
        if (error.response) {
            assert(false, error.response.data);
        } else {
            assert(false, error.message, SDKError.SERVICE_FAILED);
        }
    }
};

module.exports = {
    sendRequest,
    sendMultipartRequest
};
