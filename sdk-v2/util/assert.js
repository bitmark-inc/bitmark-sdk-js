'use strict';
const _ = require('lodash');

const SDKError = require('./sdk-error');

let assert = function (condition, message, code) {
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

assert.parameter = function (condition, message) {
    return assert(condition, message, SDKError.INVALID_PARAMETER_ERROR_CODE);
};

module.exports = assert;
