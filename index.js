const assert = require('./sdk/util/assert.js');
const logger = require('./sdk/util/logger');
const NETWORKS_CONFIG = require('./sdk/config/network-config');

module.exports = exports = {
    init: function (config) {
        assert(config, 'Config is required');
        config.network = config.network || NETWORKS_CONFIG.default_network;

        assert([NETWORKS_CONFIG.livenet.name, NETWORKS_CONFIG.testnet.name].includes(config.network), 'Network is supported');
        assert(config.apiToken, 'API Token is required');

        let sdkLogger;
        if (config.logger) {
            sdkLogger = logger.createLogger(config.logger);
        }

        global.getSDKLogger = () => sdkLogger;
        global.getSDKConfig = () => config;
    },
    Account: require('./sdk/core/account'),
    Asset: require('./sdk/core/asset'),
    Bitmark: require('./sdk/core/bitmark'),
    Transaction: require('./sdk/core/transaction'),
    Constants: require('./sdk/constant/constants'),
    BitmarkCore: require('./sdk/util/bitmark-core')
};
