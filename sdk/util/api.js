let request = require('request');
let networks = require('../networks');

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
    method = method.toUpperCase();
    options.method = method;
    options.uri = url;

    if (method === 'GET') {
      options.qs = params;
    } else if (method === 'POST') {
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
