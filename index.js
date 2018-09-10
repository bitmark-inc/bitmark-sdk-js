const assert = require('./sdk-v2/util/assert.js');
const NETWORKS_CONFIG = require('./sdk-v2/config/network-config');

module.exports = exports = {
    init: function (config) {
        assert(config, 'Config is required');
        config.network = config.network || NETWORKS_CONFIG.default_network;

        assert([NETWORKS_CONFIG.livenet.name, NETWORKS_CONFIG.testnet.name].includes(config.network), 'Network is supported');
        assert(config.apiToken, 'API Token is required');

        global.getSDKConfig = () => config;
    },
    Account: require('./sdk-v2/core/account'),
    Asset: require('./sdk-v2/core/asset'),
    Bitmark: require('./sdk-v2/core/bitmark'),
    Transaction: require('./sdk-v2/core/transaction')
};
