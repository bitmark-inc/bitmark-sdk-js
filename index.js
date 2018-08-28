const assert = require('./sdk-v2/util/assert.js');
const NETWORKS_CONFIG = require('./sdk-v2/config/network-config');

// global.__baseBitmarkSDKModulePath = __dirname + '/';
// module.exports = exports = {
//   Account: require('./sdk/account'),
//   Seed: require('./sdk/seed'),
//   AccountNumber: require('./sdk/account-number'),
//   AuthKey: require('./sdk/auth-key'),
//   Asset: require('./sdk/records/asset'),
//   Issue: require('./sdk/records/issue'),
//   Transfer: require('./sdk/records/transfer'),
//
//   API: require('./sdk/api'),
//
//   config: require('./sdk/config'),
//   networks: require('./sdk/networks'),
//
//   util: require('./sdk/util')
// };

module.exports = exports = {
    init: function (config) {
        assert(config, 'Config is required');
        config.network = config.network || NETWORKS_CONFIG.default_network;

        assert([NETWORKS_CONFIG.livenet.name, NETWORKS_CONFIG.testnet.name].includes(config.network), 'Network is supported');

        global.getSDKConfig = () => config;
    },
    Account: require('./sdk-v2/core/account'),
    Asset: require('./sdk-v2/core/asset'),
    Bitmark: require('./sdk-v2/core/bitmark'),
};
