'use strict';

let common = require('./util/common.js');
let varint = require('./util/varint.js');
let assert = require('./util/assert.js');
let _ = require('lodash');

let networks = require('./networks.js');
let config = require('./config.js');
let BigInteger = require('bn.js');
let bip39 = require('./bip39').words;

function RecoveryPhraseInfo(values) {
  this.getValues = function() { return values; }
}

function standardizeNetwork(network) {
  network = network || networks.livenet;
  if (_.isString(network)) {
    network = networks[network];
    assert(network, new TypeError('Seed error: can not recognize network'));
  }
  return network;
}

let masks = [new BigInteger('0'), new BigInteger('1'), new BigInteger('3'), new BigInteger('7'), new BigInteger('15'), new BigInteger('31'), new BigInteger('63'), new BigInteger('127'), new BigInteger('255'), new BigInteger('511'), new BigInteger('1023')];

function exportToWords(core, network) {
  assert(core && Buffer.isBuffer(core) && core.length === config.core.length, new TypeError('Recovery Phrase error: Invalid core'));
  assert(network, new TypeError('Recovery Phrase error: Invalid network'));

  let value = Buffer.concat([varint.encode(network.core_value), core]);
  
  let phrase = [];
  let accumulator = new BigInteger('0');
  let bits = 0;
  for (let i = 0, length = value.length; i < length; i++) {
    accumulator.ishln(8).iadd(new BigInteger(value[i].toString()));
    bits += 8;
    if (bits >= 11) {
      bits -= 11; // [ 11 bits] [offset bits]

      let index = accumulator.shrn(bits).toNumber();
      accumulator.iand(masks[bits]);
      phrase.push(bip39[index]);
    }
  }
  return phrase;
}

function parseWords(words) {
  assert(_.isArray(words), new TypeError('Recovery Phrase error: words must be an array'));
  assert(words.length === 24, new TypeError('Recovery Phrase error: must be 24 words'));

  let bytes = [];
  let remainder = new BigInteger('0');
  let bits = 0;

  for (let i = 0, totalWords = words.length; i < totalWords; i++) {
    let word = words[i];
    let n = bip39.indexOf(word);

    if (n < 0) {
      throw new Error(`Recovery Phrase error: invalid word ${word}`);
    }

    remainder.ishln(11).iadd(new BigInteger(n.toString()));
    for (bits += 11; bits >= 8; bits -= 8) {
      let a = (new BigInteger('ff', 16)).and(remainder.shrn(bits - 8));
      bytes.push(a.toNumber());
    }

    remainder.iand(masks[bits]);
  }

  if (bytes.length !== 33) {
    throw new Error(`Recovery Phrase error: only get ${bytes.length} from words`);
  }

  return new RecoveryPhraseInfo({
    _core: Buffer.from(bytes.slice(1)),
    _network: bytes[0] === networks.livenet.core_value ? 'livenet' : 'testnet',
    _words: words
  });
}

function RecoveryPhrase(network) {
  if (!(this instanceof RecoveryPhrase)) {
    return new RecoveryPhrase(network);
  }

  if (network instanceof RecoveryPhraseInfo) {
    common.addImmutableProperties(this, network.getValues());
    return;
  }

  throw new Error('Recovery Phrase error: calling RecoveryPhrase constructor directly is now deprecated');
}

RecoveryPhrase.fromCore = RecoveryPhrase.fromBuffer = function(buffer, network) {
  assert(Buffer.isBuffer(buffer), new TypeError('Recovery Phrase error: fromCore requires Buffer instance'));
  assert(buffer.length === 32, new TypeError('Recovery Phrase error: buffer must be 32 bytes'));

  network = standardizeNetwork(network);
  let info = new RecoveryPhraseInfo({
    _network: network.name,
    _words: exportToWords(buffer, network),
    _core: buffer
  });
  return new RecoveryPhrase(info);
}

RecoveryPhrase.fromString = function(phrase) {
  assert(_.isString(phrase), new TypeError('Recovery Phrase error: Expect ' + phrase + ' to be a string'));
  phrase = phrase.replace(/\s\s/g, ' ');
  return new RecoveryPhrase(parseWords(phrase.split(' ')));
}

RecoveryPhrase.isValid = function(phrase) {
  if (!_.isString(phrase)) {
    return false;
  }

  try {
    phrase = phrase.replace(/\s\s/g, ' ');
    RecoveryPhrase.fromString(phrase.split(' '));
    return true;
  } catch (error) {
    return false;
  }
}

RecoveryPhrase.prototype.toString = function() { return this._words.join(' '); };
RecoveryPhrase.prototype.toWords = function() { return this._words; };
RecoveryPhrase.prototype.getNetwork = function() { return this._network; };
RecoveryPhrase.prototype.getCore = RecoveryPhrase.prototype.toBuffer = function() { return this._core };

module.exports = exports = RecoveryPhrase;
