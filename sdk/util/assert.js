let _ = require('lodash');
let SDKError = require('../error');

module.exports = function(condition, message, code) {
  let error;
  if (!condition) {
    if (_.isString(message)) {
      error = code ? new SDKError(message, code) : SDKError.serviceFailed(message);
    } else if (!_.isError(message)) {
      error = new SDKError(message);
    } else {
      error = message;
    }
    throw error;
  }
};
