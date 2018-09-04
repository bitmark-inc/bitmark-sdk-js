'use strict';
const _ = require('lodash');

class SDKError extends Error {
    constructor(message, code) {
        if (!_.isString(message) && message.message) { // in case of passing object {message, code}
            code = message.code;
            message = message.message;
        }
        message = SDKError.buildMessage(message, code);

        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.code = code;
        this.message = message;
    }
}

SDKError.INVALID_PARAMETER_ERROR_CODE = 1000;
SDKError.SERVICE_FAILED = 7000;
SDKError.OPERATION_FORBIDDEN = 2000;

SDKError.buildMessage = (message, code) => {
    switch (code) {
        case SDKError.INVALID_PARAMETER_ERROR_CODE:
            if (message.indexOf('invalid parameters: ') === -1) {
                message = `invalid parameters: ${message}`;
            }
            break;
        case SDKError.SERVICE_FAILED:
            if (message.indexOf('service failed: ') === -1) {
                message = `service failed: ${message}`;
            }
            break;
        default:
            break;
    }
    return message;
};

SDKError.invalidParameter = (message) => {
    return new SDKError(message, SDKError.INVALID_PARAMETER_ERROR_CODE)
};

SDKError.serviceFailed = (message) => {
    return new SDKError(message, SDKError.SERVICE_FAILED);
};

SDKError.operationFobidden = (message) => {
    return new SDKError(message, SDKError.OPERATION_FORBIDDEN);
};

require('util').inherits(SDKError, Error);

module.exports = SDKError;
