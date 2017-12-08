let assert = require('../util/assert.js');

let axios = require('axios');
let FormData = require('form-data')
let networks = require('../networks');
let _ = require('lodash');
let SDKError = require('../error');

let sendRequest = async (options) => {
  options = options || {};
  let method = options.method;
  let apiUrl = options.url;
  let params = options.params;
  let networkName = options.network;
  let network = networkName ? networks[networkName] : networks['livenet'];

  assert(network, 'unrecognized network', SDKError.INVALID_PARAMETERS_ERROR_CODE);
  assert(apiUrl, 'missing api url', SDKError.SERVICE_FAILED);

  let url = `${network.api_server}/${network.api_version}/${apiUrl}`;
  let requestOptions = {};
  method = method.toUpperCase();
  requestOptions.method = method;
  requestOptions.url = url;

  if (method === 'GET') {
    requestOptions.params = params;
  } else if (method === 'POST') {
    requestOptions.data = params;
  } else {
    throw SDKError.invalidParameter('method is not supported');
  }

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
}


let sendMultipartRequest = async (options) => {
  options = options || {};
  let apiUrl = options.url;
  let params = options.params;
  let networkName = options.network;
  let headers = options.headers;
  let network = networkName ? networks[networkName] : networks['livenet'];

  assert(network, 'unrecognized network', SDKError.INVALID_PARAMETERS_ERROR_CODE);
  assert(apiUrl, 'missing api url', SDKError.SERVICE_FAILED);

  let url = `${network.api_server}/${network.api_version}/${apiUrl}`;

  let form = new FormData()
  for (let i in params) {
    form.append(i, params[i])
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
}

module.exports = {
  sendRequest,
  sendMultipartRequest
}
