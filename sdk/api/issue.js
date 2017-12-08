const MAX_QUANTITY = 100;

const API_NAME = 'issue';
const API_METHOD = 'post';

let _ = require('lodash');
let fs = require('fs');

let util = require('../util');
let Asset = require('../records/asset');
let Issue = require('../records/issue');


let upload = (fileReaderStream, accessibility, assetId, account) => {
  let requester = account.getAccountNumber().toString();
  let timestamp = new Date().getTime();
  let messageToSign = `uploadAsset|${assetId}|${requester}|${timestamp}`;
  let signature = account.getAuthKey().sign(messageToSign).toString('hex');
  let headers = {
    requester,
    timestamp,
    signature
  }

  return util.api.sendMultipartRequest({
    url: 'assets',
    params: {file: fileReaderStream, accessibility, asset_id: assetId},
    headers,
    network: account.getNetwork()
  });
}

let issue = async (asset, quantity, account) => {
  util.assert(!!asset, 'Issue error: asset is required');
  util.assert(_.isNumber(quantity), 'Issue error: quantity must be a number');
  util.assert(quantity <= MAX_QUANTITY, `Issue error: quantity can not be greater than ${MAX_QUANTITY}`);
  util.assert(quantity > 0, 'Issue error: quantity must be greater than 0');

  if (asset instanceof Asset) {
    let file = asset.getFile();
    if (file) {
      await upload(fs.createReadStream(file), asset.getAccessibility(), asset.getId(), account);
    }
  }

  let requestBody = {issues: []};
  for (let i = 0; i < quantity; i++) {
    let issue = new Issue().fromAsset(asset).sign(account.getAuthKey());
    requestBody.issues.push(issue.toJSON());
  }

  if (asset instanceof Asset && asset.getName()) {
    if (!asset.isSigned()) {
      asset.sign(account.getAuthKey());
    }
    requestBody.assets = [asset.toJSON()];
  }

  await util.api.sendRequest({method: API_METHOD, url: API_NAME, params: requestBody, network: account.getNetwork()});
  return requestBody.issues;
}

module.exports = {issue};
