// TODO: provide a way to parse the issue from buffer and json

let common = require('../util/common.js');
let assert = require('../util/assert.js');
let varint = require('../util/varint.js');
let binary = require('../util/binary-packing.js');
let _ = require('lodash');

let keyHandlers = require('../key-types/key-handlers.js');
let config = require('../config.js');

let Asset = require('./asset.js');

function resetSignState(issue) {
  issue._txId = null;
  issue._isSigned = false;
}

function randomInteger(min , max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function Issue() {
  if (!(this instanceof Issue)) {
    return new Issue();
  }
  this.setNonce(randomInteger(1, Number.MAX_SAFE_INTEGER))
  resetSignState(this);
}

function _packRecord(issue) {
  let txBuffer;
  txBuffer = varint.encode(config.record.issue.value);
  txBuffer = binary.appendBuffer(txBuffer, new Buffer(issue._asset, 'hex'));
  txBuffer = binary.appendBuffer(txBuffer, issue._owner.pack());
  txBuffer = Buffer.concat([txBuffer, varint.encode(issue._nonce)]);
  return txBuffer;
}

Issue.prototype.fromAsset = function(asset){
  assert(asset, 'Issue error: asset is required');
  if (_.isString(asset)) {
    this._asset = asset;
  } else if (asset instanceof Asset) {
    this._asset = asset.getId();
    assert(this._asset, 'Issue error: can not get asset id');
  } else {
    throw new TypeError('Issue error: can not recognize input type');
  }
  resetSignState(this);
  return this;
};

Issue.prototype.setNonce = function(nonce){
  assert(_.isFinite(nonce) && nonce >= 0, 'Issue error: nonce must be uint64');
  this._nonce = nonce;
  resetSignState(this);
  return this;
};

Issue.prototype.sign = function(priKey){
  assert(this._asset, 'Issue error: missing asset');
  assert(this._nonce !== undefined, 'Issue error: missing nonce');
  this._owner = priKey.getAccountNumber();

  let keyHandler = keyHandlers.getHandler(priKey.getType());
  let recordPacked = _packRecord(this);
  this._signature = keyHandler.sign(recordPacked, priKey.toBuffer());
  this._isSigned = true;

  recordPacked = binary.appendBuffer(recordPacked, this._signature);
  this._txId = common.sha3_256(recordPacked).toString('hex');
  return this;
};

Issue.prototype.toJSON = function(){
  assert(this._isSigned, 'Issue error: need to sign the record before getting JSON format');
  return {
    owner: this._owner.toString(),
    signature: this._signature.toString('hex'),
    asset: this._asset,
    nonce: this._nonce
  };
};

Issue.prototype.isSigned = function() { return this._isSigned; };
Issue.prototype.getId = function() { return this._txId; };
Issue.prototype.getOwner = function(){ return this._owner; };
Issue.prototype.getSignature = function(){ return this._signature; };
Issue.prototype.getAsset = function(){ return this._asset; };

module.exports = Issue;