const API_NAME = 'transfer';
const API_METHOD = 'post';
// const ID_LENGTH = '128';

// let _ = require('lodash');
let util = require('../util');
let Transfer = require('../records/transfer');

let transfer = (link, toOwner, account) => {
  // create the record
  let record = new Transfer().fromTx(link).toAccountNumber(toOwner);
  util.assert(!!account, 'Issue error: missing account');
  record.sign(account.getAuthKey());

  // make request
  let requestBody = {transfer: record.toJSON()};
  return util.api.request({
    method: API_METHOD,
    url: API_NAME,
    params: requestBody,
    network: account.getNetwork()
  }).then(() => {
    return Promise.resolve(record);
  });
}

module.exports = {transfer};
