let request = require('request');
let networks = require('../networks');
let querystring = require('querystring');

let requestToAPI = (method, name, params, networkName) => {
  return new Promise((resolve, reject) => {

    // Validate data
    let network = networkName ? networks[networkName] : networks['livenet'];
    if (!network) {
      reject(new Error('API error: does not recognize network'));
      return;
    }

    if (!name) {
      reject(new Error('API error: name is required'));
      return;
    }

    let url = `${network.api_server}/${network.api_version}/${name}`;
    // let query = '';
    // if (params && method ==='get') {
    //   query = querystring.stringify(params);
    //   if (query) {
    //     url += '?' + query;
    //   }
    // }

    let requestCallback = (error, response, body) => {
      if (error) {
        reject(error);
      } else if (response.statusCode === 404) {
        reject({code: 404, message: 'not found'});
      } else if (response.statusCode !== 200) {
        reject(new Error(body.message));
      } else {
        resolve(body);
      }
    }

    let options = {};
    options.method = method.toUpperCase();
    options.uri = url;

    if (method === 'get') {
      options.qs = params;
    } else if (method === 'post') {
      options.json = params;
    } else {
      reject(new Error('API error: method is not supported'));
    }

    request(options, requestCallback);
  });
}

module.exports = {
  request: requestToAPI
}
