const chai = require('chai');
const expect = chai.expect;

const sdk = require('../index');
const CONSTANTS = require('./constant/constants');

describe('SDK', function () {
    describe('initialization', function () {
        it('should initialize SDK with livenet as default network', function () {
            sdk.init({apiToken: CONSTANTS.TEST_API_TOKEN});

            expect(global.getSDKConfig().network).to.equal('livenet');
        });

        it('should initialize SDK with testnet network', function () {
            sdk.init({network: 'testnet', apiToken: CONSTANTS.TEST_API_TOKEN});

            expect(global.getSDKConfig().network).to.equal('testnet');
        });

        it('should not initialize SDK with invalid network', function () {
            expect(function () {
                sdk.init({network: 'fakenet', apiToken: CONSTANTS.TEST_API_TOKEN})
            }).to.throw();
        });

        it('should initialize SDK with API Token', function () {
            sdk.init({network: 'testnet', apiToken: CONSTANTS.TEST_API_TOKEN});

            expect(global.getSDKConfig().apiToken).to.equal(CONSTANTS.TEST_API_TOKEN);
        });

        it('should not initialize SDK without API Token', function () {
            expect(function () {
                sdk.init({network: 'testnet'})
            }).to.throw();
        });
    });
});
