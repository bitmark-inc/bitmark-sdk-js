const ISSUE_BATCH_QUANTITY = 100;
const API_NAME = 'issue';
const API_METHOD = 'post';

const _ = require('lodash');
const fs = require('fs');

const util = require('../util');
const Asset = require('../records/asset');
const Issue = require('../records/issue');
const SDKError = require('../error');


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

let issue = async (asset, quantity, retryTimes, account) => {
  retryTimes = retryTimes || 1;

  util.assert.parameter(!!asset, 'missing asset');
  util.assert.parameter(asset instanceof Asset || _.isString(asset), 'asset must be Asset object or asset id string');
  util.assert.parameter(_.isNumber(quantity), 'quantity must be a number');
  util.assert.parameter(quantity > 0, 'quantity must be greater than 0');
  util.assert.parameter(_.isNumber(retryTimes), 'retryTimes must be a number');

  if (asset instanceof Asset) {
    let file = asset.getFile();
    if (file) {
      await upload(fs.createReadStream(file), asset.getAccessibility(), asset.getId(), account);
    }
  }

  let isExistingAsset = false;
  if (asset instanceof Asset && asset.getName()) {
    if (!asset.isSigned()) {
      asset.sign(account.getAuthKey());
    }
    isExistingAsset = true;
  }

  let result = {issues: []};
  let count = 0;

  while (count < quantity && retryTimes > 0) {
    let remaining = quantity - count;
    let batchLength = remaining > ISSUE_BATCH_QUANTITY ? ISSUE_BATCH_QUANTITY : remaining;
    let requestBody = {issues: []};

    if (isExistingAsset) {
      requestBody.assets = [asset.toJSON()];
    }
    for (let i = 0; i < batchLength; i++) {
      let issue = new Issue().fromAsset(asset).sign(account.getAuthKey());
      requestBody.issues.push(issue.toJSON());
  
      let issueResult = issue.toJSON();
      issueResult.id = issue.getId(); // add missing id for toJSON()
      result.issues.push(issueResult);
    }
    try {
      await util.api.sendRequest({method: API_METHOD, url: API_NAME, params: requestBody, network: account.getNetwork()});
      isExistingAsset = false;
      count += batchLength;
      delete result.error;
    } catch (error) {
      result.error = error;
      retryTimes--;
      if (retryTimes <= 0) {
        if (result.issues.length) {
          return result;
        } else {
          throw error;
        }
      }
    }
  }

  return result;
}

module.exports = {issue};
