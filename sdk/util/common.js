let sha3_256 = require('js-sha3').sha3_256;
let sha3_512 = require('js-sha3').sha3_512;
let config = require('../config.js');
let nacl = require('tweetnacl-nodewrap');
let BigInteger = require('bn.js');
let _ = require('lodash');

// [SECTION] FOR WORKING WITH KEY ALGORITHM
// ----------------------------------------
let getKeyTypeByValue = function(value){
  let typeName, typeValue;

  if (!(value instanceof BigInteger)){
    value = new BigInteger(value);
  }
  for (typeName in config.key.type){
    typeValue = config.key.type[typeName].value;
    if (value.eq(new BigInteger(typeValue))){
      return config.key.type[typeName];
    }
  }
  return null;
};

// [SECTION] FOR WORKING WITH DIFFERENT DATA TYPE
// ----------------------------------------------------
// let bufferToUint8Array = function(buffer) {
//   let ab = new ArrayBuffer(buffer.length);
//   let view = new Uint8Array(ab);
//   for (let i = 0; i < buffer.length; ++i) {
//       view[i] = buffer[i];
//   }
//   return view;
// };

// let uint8ArrayToBuffer = function(uint8Array) {
//   return new Buffer(uint8Array);
// };

let bufferEqual = function(bufferA, bufferB){
  if (bufferA.length !== bufferB.length){
    return false;
  }

  let length = bufferA.length;
  for (let i = 0; i <length; i++){
    if (bufferA[i] !== bufferB[i]){
      return false;
    }
  }
  return true;
};

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
// let shuffleArray = function(o){ //v1.0
//     for(let j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
//     return o;
// };

let normalizeStr = function(str) {
  return _.isString(str) && str.normalize ? str.normalize() : str;
};


// [SECTION] FOR WORKING WITH CRYPTO FUNCTIONS
// -------------------------------------------

let getSHA3_256 = function(buffer) {
  let resultInArrayBuffer = sha3_256.buffer(buffer);
  let resultInBuffer = new Buffer(resultInArrayBuffer);
  return resultInBuffer;
};

let getSHA3_512 = function(buffer) {
  let resultInArrayBuffer = sha3_512.buffer(buffer);
  let resultInBuffer = new Buffer(resultInArrayBuffer);
  return resultInBuffer;
};

let createSHA3_512Stream = function() {
  let hash = sha3_512.create();
  return {
    update: function(data) {
      hash.update(data);
    },
    buffer: function() {
      return hash.buffer();
    },
    hex: function() {
      return hash.hex();
    }
  }
}

// let increaseOne = function(baseLength, buffer) {
//   let nonce = buffer.slice(baseLength);
//   let value;
//   for (let i = nonce.length; i--;) {
//     value = nonce.readUInt8(i);
//     if (value === 0xff) {
//       nonce.writeUInt8(0x00, i, true);
//     } else {
//       nonce.writeUInt8(value+1, i, true);
//       return buffer;
//     }
//   }
//   // if not success to return in the loop, let's add one byte
//   let base = buffer.slice(0, baseLength);
//   return Buffer.concat([base, new Buffer([0x01]), nonce]);
// };

// let findNonce = function(base, difficulty) {
//   let nonce = new BigInteger('8000000000000000', 16);
//   let combine = Buffer.concat([base, nonce.toBuffer()]);
//   let baseLength = base.length;

//   let notFoundYet = true;
//   let hash;
//   let count = 0;

//   while (notFoundYet) {
//     combine = increaseOne(baseLength, combine);
//     hash = getSHA3_256(combine);
//     if (hash.compare(difficulty) === -1) {
//       notFoundYet = false;
//     }
//     count++;
//   }
//   nonce = combine.slice(baseLength);
//   return nonce;
// };


// [SECTION] OTHER
// ---------------
let generateRandomBytes = function(length) {
  return nacl.randomBytes(length);
};

let addImmutableProperties = function(target, properties){
  Object.keys(properties).forEach(function(key){
    Object.defineProperty(target, key, {
      configurable: false,
      enumerable: true,
      value: properties[key]
    });
  });
  return target;
};

// let getMostAppearedValue = function(dataSet, key) {
//   let valueCount = {}, finalValueString = null, resultValue = null;
//   dataSet.forEach(function(item){
//     let value = key ? item[key] : item;
//     let valueString = JSON.stringify(value);
//     valueCount[valueString] = (valueCount[valueString] || 0) + 1;
//     if (!finalValueString || valueCount[valueString] > valueCount[finalValueString]) {
//       finalValueString = valueString;
//       resultValue = value;
//     }
//   });
//   return resultValue;
// };


module.exports = {
  getKeyTypeByValue: getKeyTypeByValue,
  // bufferToUint8Array: bufferToUint8Array,
  // uint8ArrayToBuffer: uint8ArrayToBuffer,
  generateRandomBytes: generateRandomBytes,
  bufferEqual: bufferEqual,
  normalizeStr: normalizeStr,
  addImmutableProperties: addImmutableProperties,
  sha3_256: getSHA3_256,
  sha3_512: getSHA3_512,
  createSHA3_512Stream: createSHA3_512Stream
  // findNonce: findNonce,
  // getMostAppearedValue: getMostAppearedValue
};
