let chai = require('chai');
let expect = chai.expect;
let sdk = require('../../index');
let Account = sdk.Account;

describe('SDK', function () {
    describe('initialization', function () {
        it('should build with livenet as default', function () {
            sdk.init({});

            let account = new Account();
            expect(account.getNetwork()).to.equal('livenet');
        });

        it('should build for testnet if specified', function () {
            sdk.init({network: 'testnet'});

            let account = new Account();
            expect(account.getNetwork()).to.equal('testnet');
        });

        it('should throw errors on wrong network or version', function () {
            expect(function () {
                sdk.init({network: 'fakenet'})
            }).to.throw(Error);
        });
    });
});
