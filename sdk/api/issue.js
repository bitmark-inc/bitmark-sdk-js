const ASSET_ID_LENGTH = 128;
const MAX_QUANTITY = 100;

const API_NAME = 'issue';
const API_METHOD = 'post';

let _ = require('lodash');
let util = require('../util');
let lib = require('bitmark-lib');

let issue = (asset, quantity, account) => {
  let assetId;
  let assetRecord;
  let issueRecords = [];
  let issueObjects = [];

  // Validate data
  if (asset instanceof lib.Asset) {
    if (!asset.isSigned()) {
      asset.sign(account.getAuthKey());
    }
    assetId = asset.getId();
    assetRecord = asset.toJSON();
  } else {
    util.assert(_.isString(asset) && asset.length === ASSET_ID_LENGTH, 'Issue error: can not recognize the data type for asset');
    assetId = asset;
    assetRecord = null;
  }

  util.assert(quantity <= MAX_QUANTITY, `Issue error: quantity can not be greater than ${MAX_QUANTITY}`);
  util.assert(quantity > 0, 'Issue error: quantity must be greater than 0');
  util.assert(!!account, 'Issue error: missing account');

  // create issues
  for (let i = 0; i < quantity; i++) {
    let issue = new lib.Issue()
      .fromAsset(assetId)
      .sign(account.getAuthKey());
    issueObjects.push(issue);
    issueRecords.push(issue.toJSON());
  }

  // make request
  let requestBody = {};
  if (assetRecord) {
    requestBody.assets = [assetRecord];
  }
  requestBody.issues = issueRecords;

  return util.api.request(API_METHOD, API_NAME, requestBody)
    .then(() => {
      return Promise.resolve(issueObjects);
    });
}

module.exports = issue;
