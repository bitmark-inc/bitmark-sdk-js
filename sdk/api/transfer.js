const API_NAME = 'transfer';
const API_METHOD = 'post';

// let _ = require('lodash');
let util = require('../util');
let Transfer = require('../records/transfer');
let bitmarkAPI = require('./bitmarks');

let transfer = (bitmarkId, toAccountNumber, account) => {
  util.assert(!!account, 'Transfer error: missing account');
  util.assert(!!bitmarkId, 'Transfer error: missing bitmark id');
  util.assert(!!toAccountNumber, 'Transfer error: missing account number')

  let record;

  return bitmarkAPI.getBitmark(bitmarkId, {pending: true}, account.getNetwork())
    .then(result => {
      let bitmark = result.bitmark;
      record = new Transfer().fromTx(bitmark.head_id).toAccountNumber(toAccountNumber).sign(account.getAuthKey());
      
      let requestBody = {transfer: record.toJSON()};
      return util.api.sendRequest({
        method: API_METHOD,
        url: API_NAME,
        params: requestBody,
        network: account.getNetwork()
      });
    })
    .then(() => {
      return Promise.resolve({transfer: record.toJSON(true)});
    });
}

module.exports = {transfer};
