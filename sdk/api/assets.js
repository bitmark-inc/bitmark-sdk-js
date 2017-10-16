const API_NAME = 'assets';
const API_METHOD = 'get';

let _ = require('lodash');
let util = require('../util');

let getAsset = (id, options, network) => {
  options = options || {};
  return util.api.request({
    method: API_METHOD,
    url: `${API_NAME}/${id}`,
    params: options,
    network
  }).then((result) => {
    return Promise.resolve(result);
  });
}

let getAssets = (options, network) => {
  options = options || {};
  return util.api.request({
    method: API_METHOD,
    url: API_NAME,
    params: options,
    network
  }).then((result) => {
    return Promise.resolve(result);
  });
}

module.exports = {getAsset, getAssets};
