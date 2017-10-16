const API_NAME = 'bitmarks';
const API_METHOD = 'get';

let _ = require('lodash');
let util = require('../util');

let getBitmark = (id, network, options) => {
  options = options || {};
  return util.api.request(API_METHOD, `${API_NAME}/${id}`, options, network)
  .then((result) => {
    return Promise.resolve(result);
  });
}

let getBitmarks = (network, options) => {
  options = options || {};
  return util.api.request(API_METHOD, API_NAME, options, network)
  .then((result) => {
    return Promise.resolve(result);
  });
}

module.exports = {getBitmark, getBitmarks};
