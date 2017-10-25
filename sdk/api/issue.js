const ASSET_ID_LENGTH = 128;
const MAX_QUANTITY = 100;

const API_NAME = 'issue';
const API_METHOD = 'post';

let _ = require('lodash');
let fs = require('fs');
let Duplex = require('stream').Duplex;

let util = require('../util');
let Asset = require('../records/asset');
let Issue = require('../records/issue');

// let upload = (fileReaderStream, asset, account) => {
//   let registrant = account.getAccountNumber().toString();
//   let timestamp = new Date().getTime();
//   let messageToSign = `uploadAsset|${registrant}|${asset.getId()}|${timestamp}`;
//   let signature = account.getAuthKey().sign(messageToSign).toString('hex');
//   let headers = {
//     registrant,
//     timestamp,
//     signature
//   }

//   return util.api.sendMultipartRequest({
//     url: `assets/${asset.getId()}`,
//     params: {file: fileReaderStream, scope: 'public'},
//     headers,
//     network: account.getNetwork()
//   });
// }

// let issueNew = (filepath, asset, quantity, account) => {
//   let assetId;
//   let assetRecord;
//   let issueRecords = [];
//   let issueObjects = [];
//   let fileReaderStream = null;

//   // Validate data
//   util.assert(!!filepath && (_.isString(filepath) || filepath instanceof fs.ReadStream),
//     'Issue error: filepath/filestream is required for a new asset');
//   util.assert(asset instanceof Asset, 'Issue error: asset must be an instance of Asset');
//   util.assert(quantity <= MAX_QUANTITY, `Issue error: quantity can not be greater than ${MAX_QUANTITY}`);
//   util.assert(quantity > 0, 'Issue error: quantity must be greater than 0');
//   util.assert(!!account, 'Issue error: missing account');

//   if (!asset.isSigned()) {
//     asset.sign(account.getAuthKey());
//   }

//   let file = _.isString(filepath) ? fs.createReadStream(filepath) : filepath;

//   // create issues
//   for (let i = 0; i < quantity; i++) {
//     let issue = new Issue()
//       .fromAsset(asset)
//       .sign(account.getAuthKey());
//     issueObjects.push(issue);
//     issueRecords.push(issue.toJSON());
//   }

//   // Make request
//   return upload(file, asset, account)
//     .then(() => {
//       let requestBody = {};
//       requestBody.assets = [asset.toJSON()];
//       requestBody.issues = issueRecords;
//       return util.api.sendRequest({method: API_METHOD, url: API_NAME, params: requestBody, network: account.getNetwork()})
//     }).then(() => {
//       return Promise.resolve(issueObjects);
//     });
// }

// let issueMore = (asset, quantity, account) => {
//   let assetId;
//   let issueRecords = [];
//   let issueObjects = [];

//   // Validate data
//   if (asset instanceof Asset) {
//     if (!asset.isSigned()) {
//       asset.sign(account.getAuthKey());
//     }
//     assetId = asset.getId();
//   } else if (_.isString(asset)) {
//     util.assert(asset.length === ASSET_ID_LENGTH, 'Issue error: can not recognize the data type for asset');
//     assetId = asset;
//   }

//   util.assert(quantity <= MAX_QUANTITY, `Issue error: quantity can not be greater than ${MAX_QUANTITY}`);
//   util.assert(quantity > 0, 'Issue error: quantity must be greater than 0');
//   util.assert(!!account, 'Issue error: missing account');

//   // create issues
//   for (let i = 0; i < quantity; i++) {
//     let issue = new Issue()
//       .fromAsset(assetId)
//       .sign(account.getAuthKey());
//     issueObjects.push(issue);
//     issueRecords.push(issue.toJSON());
//   }

//   // make request
//   let requestBody = {issues: issueRecords};
//   return util.api.sendRequest({
//     method: API_METHOD,
//     url: API_NAME,
//     params: requestBody,
//     network: account.getNetwork()
//   }).then(() => {
//     return Promise.resolve(issueObjects);
//   });
// }


let bufferToStream = (buffer) => {  
  let stream = new Duplex();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

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

let compputeFingerprint = (file) => {
  if (Buffer.isBuffer(file)) {
    return Promise.resolve(util.fingerprint.fromBuffer(file));
  }

  if (file instanceof fs.ReadStream) {
    return util.fingerprint.fromStream(file);
  }
}

let issue = (file, accessibility, name, metadata, quantity, account) => {
  // Validate data
  util.assert(!!file && (_.isString(file) || Buffer.isBuffer(file)),
    'Issue error: filepath/buffer is required for a new asset');
  util.assert(_.isString(name), 'Issue error: name must be a string');
  util.assert(quantity <= MAX_QUANTITY, `Issue error: quantity can not be greater than ${MAX_QUANTITY}`);
  util.assert(quantity > 0, 'Issue error: quantity must be greater than 0');
  util.assert(!!account, 'Issue error: missing account');

  let asset, issues = [];

  return compputeFingerprint(_.isString(file) ? fs.createReadStream(file) : file)
    .then(fingerprint => {
      asset = new Asset().setName(name).setMetadata(metadata).setFingerprint(fingerprint).sign(account.getAuthKey());
      for (let i = 0; i < quantity; i++) {
        let issue = new Issue().fromAsset(asset).sign(account.getAuthKey());
        issues.push(issue);
      }
      return upload(_.isString(file) ? fs.createReadStream(file) : bufferToStream(file), accessibility, asset.getId(), account);
    })
    .then(() => {
      let requestBody = {};
      requestBody.assets = [asset.toJSON()];
      requestBody.issues = issues.map(issue => issue.toJSON());
      return util.api.sendRequest({method: API_METHOD, url: API_NAME, params: requestBody, network: account.getNetwork()})
    }).then((response) => {
      return Promise.resolve(response);
    });
}

module.exports = {issue};
