const API_NAME = 'assetes';
const API_METHOD = 'get';

let _ = require('lodash');
let util = require('../util');

let getAsset = (id, network, options) => {
  options = options || {};
  return util.api.request(API_METHOD, `${API_NAME}/${id}`, options, network)
  .then((result) => {
    return Promise.resolve(result);
  });
}

let getAssets = (network, options) => {
  options = options || {};
  return util.api.request(API_METHOD, API_NAME, options, network)
  .then((result) => {
    return Promise.resolve(result);
  });
}

module.exports = {getAsset, getAssets};
