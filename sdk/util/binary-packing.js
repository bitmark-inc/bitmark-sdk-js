let varint = require('./varint.js');


let appendString = function(desBuffer, str, encoding) {
  encoding = encoding || 'utf8';
  let valueBuffer = str ? new Buffer(str, encoding) : new Buffer(0);
  let lengthBuffer = varint.encode(valueBuffer.length);
  let newBufferLength = desBuffer.length + lengthBuffer.length + valueBuffer.length;

  return Buffer.concat([desBuffer, lengthBuffer, valueBuffer], newBufferLength);
};

let appendBuffer = function(desBuffer, srcBuffer) {
  let lengthBuffer = varint.encode(srcBuffer.length);
  let newBufferLength = desBuffer.length + lengthBuffer.length + srcBuffer.length;

  return Buffer.concat([desBuffer, lengthBuffer, srcBuffer], newBufferLength);
};

// let appendTimestamp = function(desBuffer, timestamp) {
//   let seconds = Math.floor(timestamp / 1000);
//   let secondsBuffer = varint.encode(seconds);
//   let newBufferLength = desBuffer.length + secondsBuffer.length;
//   return Buffer.concat([desBuffer, secondsBuffer], newBufferLength);
// };

module.exports =  {
  appendString: appendString,
  appendBuffer: appendBuffer
};
