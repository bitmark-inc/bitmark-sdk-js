const API_NAME = 'bitmarks';
const API_METHOD = 'get';

const request = require('axios')
let util = require('../util');

let downloadBitmarkAsset = async (id, network) => {
  let result = await util.api.sendRequest({
    method: API_METHOD,
    url: `${API_NAME}/${id}/asset`,
    network
  });
  let response = await request.get(result.url, {
    responseType: 'arraybuffer'
  });
  return response.data;
}

let getBitmark = (id, options, network) => {
  options = options || {};
  return util.api.sendRequest({
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
  return util.api.sendRequest({
    method: API_METHOD,
    url: API_NAME,
    params: options,
    network
  }).then((result) => {
    return Promise.resolve(result);
  });
}

module.exports = {
  getBitmark,
  getBitmarks,
  downloadBitmarkAsset
};
