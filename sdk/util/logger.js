'use strict';
const path = require('path');
const winston = require('winston');

const LOG_CONFIG = require('../config/log-config');
const common = require('./common');


let createLogger = (options) => {
    let loggerTransports = [];

    if (options.logFolder) {
        common.mkdirSync(options.logFolder);

        loggerTransports.push(new winston.transports.File({
            filename: path.join(options.logFolder, (options.filename || LOG_CONFIG.default_file_name) + '.log'),
            maxFiles: options.maxFiles || 10,
            maxsize: options.maxSize || 1024 * 1024,
            tailable: true
        }));
    }

    if (options.console === true) {
        loggerTransports.push(new winston.transports.Console());
    }

    const logFormat = winston.format.printf(({level, message, timestamp}) => {
        return `${timestamp} ${level}: ${message}`;
    });

    return winston.createLogger({
        transports: loggerTransports,
        level: options.level || LOG_CONFIG.default_log_level,
        format: winston.format.combine(
            winston.format.timestamp(),
            logFormat
        )
    });
};

module.exports = {
    createLogger
};

