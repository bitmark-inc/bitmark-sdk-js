let isArray = Array.isArray;

function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

let stringTag = '[object String]';
let objectProto = Object.prototype;
let objectToString = objectProto.toString;
function isString(value) {
  return typeof value == 'string' ||
    (!isArray(value) && isObjectLike(value) && objectToString.call(value) == stringTag);
}

// function isFinite(value) {
//   return typeof value == 'number' && Number.isFinite(value);
// }

module.exports = {
  isArray: isArray,
  isObjectLike: isObjectLike,
  isString: isString
};
