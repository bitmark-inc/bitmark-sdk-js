'use strict';
const axios = require('axios');
const qs = require('qs');

const NETWORKS_CONFIG = require('../config/network-config');
const assert = require('../util/assert.js');
const common = require('../util/common');
const SDKError = require('../util/sdk-error');
const packageJson = require('../../package.json');


let sendRequest = async (options) => {
    common.makeSureSDKInitialized();
    const sdkConfig = global.getSDKConfig();
    const sdkLogger = global.getSDKLogger();

    options = options || {};
    let method = options.method;
    let apiUrl = options.url;
    let params = options.params;
    let headers = options.headers;
    let network = NETWORKS_CONFIG[sdkConfig.network];
    let apiVersion = options.apiVersion || network.api_version;

    assert(network, 'unrecognized network', SDKError.INVALID_PARAMETER_ERROR_CODE);
    assert(apiUrl, 'missing api url', SDKError.SERVICE_FAILED);

    let url = `${network.api_server}/${apiVersion}/${apiUrl}`;
    let requestOptions = {};
    method = method.toUpperCase();
    requestOptions.method = method;
    requestOptions.url = url;

    if (sdkLogger) {
        sdkLogger.log(sdkLogger.level, `${requestOptions.method} ${requestOptions.url}`);
    }

    if (method === 'GET') {
        requestOptions.params = params;
        requestOptions.paramsSerializer = function (params) {
            return qs.stringify(params, {arrayFormat: 'repeat'})
        }
    } else if (method === 'POST') {
        requestOptions.data = params;
    } else if (method === 'PATCH') {
        requestOptions.data = params;
    } else {
        throw SDKError.invalidParameter('method is not supported');
    }

    // Headers
    requestOptions.headers = {
        'api-token': sdkConfig.apiToken,
        'user-agent': `${packageJson.name}/${packageJson.version}, ${process.platform}, ${process.version}`
    };

    if (headers) {
        Object.assign(requestOptions.headers, headers);
    }

    let response = await axios(requestOptions);

    if (sdkLogger) {
        sdkLogger.log(sdkLogger.level, `${response.status} ${response.statusText}`);
    }

    return response.data;
};


module.exports = {
    sendRequest
};