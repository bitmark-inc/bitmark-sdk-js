const chai = require('chai');
const expect = chai.expect;
const sdk = require('../../index');

describe('SDK', function () {
    describe('initialization', function () {
        it('should build with livenet as default', function () {
            sdk.init({});

            expect(global.getSDKConfig().network).to.equal('livenet');
        });

        it('should build for testnet if specified', function () {
            sdk.init({network: 'testnet'});

            expect(global.getSDKConfig().network).to.equal('testnet');
        });

        it('should throw errors on wrong network', function () {
            expect(function () {
                sdk.init({network: 'fakenet'})
            }).to.throw(Error);
        });
    });
});
