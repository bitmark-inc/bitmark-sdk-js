let request = require('axios');
let FormData = require('form-data')
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

    let requestOptions = {};
    method = method.toUpperCase();
    requestOptions.method = method;
    requestOptions.url = url;

    if (method === 'GET') {
      requestOptions.params = params;
    } else if (method === 'POST') {
      requestOptions.data = params;
    } else {
      reject(new Error('API error: method is not supported'));
    }

    resolve(request(requestOptions)
      .then((response) => {
        let body = response.data
        if (response.status !== 200) {
          if (typeof body === "string") {
            throw new Error(body);
          } else {
            throw new Error(body.message);
          }
        } else {
          return body;
        }
      })
      .catch(e => {
        throw e;
      })
    )
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

    let form = new FormData()
    for (let i in params) {
      form.append(i, params[i])
    }

    let url = `${network.api_server}/${network.api_version}/${apiUrl}`;

    let requestOptions = {
      method: 'post',
      url: url,
      data: form,
      headers: _.merge(headers, form.getHeaders())
    };

    resolve(request(requestOptions)
      .then((response) => {
        let body = response.data
        if (response.status !== 200) {
          if (typeof body === "string") {
            throw new Error(body);
          } else {
            throw new Error(body.message);
          }
        } else {
          return body;
        }
      }).catch(e => {
        throw e;
      })
    )
  });
}

module.exports = {
  sendRequest,
  sendMultipartRequest
}
