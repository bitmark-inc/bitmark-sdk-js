let request = require('request');
let networks = require('../networks');
let _ = require('lodash');

let sendRequest = (options) => {
  options = options || {};
  return new Promise((resolve, reject) => {
    let method = options.method;
    let apiUrl = options.url;
    let params = options.params;
    let networkName = options.network;

    // Validate data
    let network = networkName ? networks[networkName] : networks['livenet'];
    if (!network) {
      reject(new Error('API error: does not recognize network'));
      return;
    }

    if (!apiUrl) {
      reject(new Error('API error: api url is required'));
      return;
    }

    let url = `${network.api_server}/${network.api_version}/${apiUrl}`;

    let requestCallback = (error, response, body) => {
      if (error) {
        reject(error);
      } else if (response.statusCode !== 200) {
          if (typeof body === "string") {
            reject(new Error(body));
          } else {
            reject(new Error(body.message));
          }
      } else {
        resolve(body);
      }
    }

    let requestOptions = {};
    method = method.toUpperCase();
    requestOptions.method = method;
    requestOptions.uri = url;
    requestOptions.json = true;

    if (method === 'GET') {
      requestOptions.qs = params;
    } else if (method === 'POST') {
      requestOptions.json = params;
    } else {
      reject(new Error('API error: method is not supported'));
    }

    request(requestOptions, requestCallback);
  });
}

let sendMultipartRequest = (options) => {
  options = options || {};
  return new Promise((resolve, reject) => {
    let apiUrl = options.url;
    let params = options.params;
    let networkName = options.network;
    let headers = options.headers;
    
    // Validate data
    let network = networkName ? networks[networkName] : networks['livenet'];
    if (!network) {
      reject(new Error('API error: does not recognize network'));
      return;
    }

    if (!apiUrl) {
      reject(new Error('API error: api name is required'));
      return;
    }

    let url = `${network.api_server}/${network.api_version}/${apiUrl}`;

    let requestCallback = (error, response, body) => {
      if (error) {
        reject(error);
      } else if (response.statusCode !== 200) {
        reject(new Error(body.message));
      } else {
        resolve(body);
      }
    }

    let requestOptions = {
      method: 'post',
      uri: url,
      formData: params,
      headers: headers,
      json: true
    };

    request(requestOptions, requestCallback);    
  });
}

module.exports = {sendRequest, sendMultipartRequest}
