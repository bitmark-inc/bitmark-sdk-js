const API_NAME = 'bitmarks';
const API_METHOD = 'get';

let util = require('../util');

let getBitmark = (id, options, network) => {
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

let getBitmarks = (options, network) => {
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

module.exports = {getBitmark, getBitmarks};
