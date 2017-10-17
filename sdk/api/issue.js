const ASSET_ID_LENGTH = 128;
const MAX_QUANTITY = 100;

const API_NAME = 'issue';
const API_METHOD = 'post';

let _ = require('lodash');
let util = require('../util');
let Asset = require('../records/asset');
let Issue = require('../records/issue');
let fs = require('fs');

let upload = (fileReaderStream, asset, account) => {
  let registrant = account.getAccountNumber().toString();
  let timestamp = new Date().getTime();
  let messageToSign = `uploadAsset|${registrant}|${asset.getId()}|${timestamp}`;
  let signature = account.getAuthKey().sign(messageToSign).toString('hex');
  let headers = {
    registrant,
    timestamp,
    signature
  }

  return util.api.sendMultipartRequest({
    url: `assets/${asset.getId()}`,
    params: {file: fileReaderStream, scope: 'public'},
    headers,
    network: account.getNetwork()
  });
}

let issueNew = (filepath, asset, quantity, account) => {
  let assetId;
  let assetRecord;
  let issueRecords = [];
  let issueObjects = [];
  let fileReaderStream = null;

  // Validate data
  util.assert(!!filepath && (_.isString(filepath) || filepath instanceof fs.ReadStream),
    'Issue error: filepath/filestream is required for a new asset');
  util.assert(asset instanceof Asset, 'Issue error: asset must be an instance of Asset');
  util.assert(quantity <= MAX_QUANTITY, `Issue error: quantity can not be greater than ${MAX_QUANTITY}`);
  util.assert(quantity > 0, 'Issue error: quantity must be greater than 0');
  util.assert(!!account, 'Issue error: missing account');

  if (!asset.isSigned()) {
    asset.sign(account.getAuthKey());
  }

  let file = _.isString(filepath) ? fs.createReadStream(filepath) : filepath;

  // create issues
  for (let i = 0; i < quantity; i++) {
    let issue = new Issue()
      .fromAsset(asset)
      .sign(account.getAuthKey());
    issueObjects.push(issue);
    issueRecords.push(issue.toJSON());
  }

  // Make request
  return upload(file, asset, account)
    .then(() => {
      let requestBody = {};
      requestBody.assets = [asset.toJSON()];
      requestBody.issues = issueRecords;
      return util.api.sendRequest({method: API_METHOD, url: API_NAME, params: requestBody, network: account.getNetwork()})
    }).then(() => {
      return Promise.resolve(issueObjects);
    });
}

let issueMore = (asset, quantity, account) => {
  let assetId;
  let issueRecords = [];
  let issueObjects = [];

  // Validate data
  if (asset instanceof Asset) {
    if (!asset.isSigned()) {
      asset.sign(account.getAuthKey());
    }
    assetId = asset.getId();
  } else if (_.isString(asset)) {
    util.assert(asset.length === ASSET_ID_LENGTH, 'Issue error: can not recognize the data type for asset');
    assetId = asset;
  }

  util.assert(quantity <= MAX_QUANTITY, `Issue error: quantity can not be greater than ${MAX_QUANTITY}`);
  util.assert(quantity > 0, 'Issue error: quantity must be greater than 0');
  util.assert(!!account, 'Issue error: missing account');

  // create issues
  for (let i = 0; i < quantity; i++) {
    let issue = new Issue()
      .fromAsset(assetId)
      .sign(account.getAuthKey());
    issueObjects.push(issue);
    issueRecords.push(issue.toJSON());
  }

  // make request
  let requestBody = {issues: issueRecords};
  return util.api.sendRequest({
    method: API_METHOD,
    url: API_NAME,
    params: requestBody,
    network: account.getNetwork()
  }).then(() => {
    return Promise.resolve(issueObjects);
  });
}

module.exports = {issueNew, issueMore};
