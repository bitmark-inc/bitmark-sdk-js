const chai = require('chai');
const expect = chai.expect;

const sdk = require('../../../../index');
const Account = sdk.Account;
const Bitmark = sdk.Bitmark;

let testData = {
    testnet: {
        seed: '5XEECt18HGBGNET1PpxLhy5CsCLG9jnmM6Q8QGF4U2yGb1DABXZsVeD',
        phrase: 'accident syrup inquiry you clutch liquid fame upset joke glow best school repeat birth library combine access camera organ trial crazy jeans lizard science',
        accountNumber: 'ec6yMcJATX6gjNwvqp8rbc4jNEasoUgbfBBGGyV5NvoJ54NXva',
        publicKey: '58760a01edf5ed4f95bfe977d77a27627cd57a25df5dea885972212c2b1c0e2f',
        network: 'testnet',
        version: 1,
        existedAssetId: '0e0b4e3bd771811d35a23707ba6197aa1dd5937439a221eaf8e7909309e7b31b6c0e06a1001c261a099abf04c560199db898bc154cf128aa9efa5efd36030c64',
        receiverAccount: {
            accountNumber: 'eujeF5ZBDV3qJyKeHxNqnmJsrc9iN7eHJGECsRuSXvLmnNjsWX',
            publicKey: '807f4d123c944e0c3ecc95d9bde89916ced6341a8c8cedeb8caafef8f35654e7',
            seed: '5XEECsXPYA9wDVXMtRMAVrtaWx7WSc5tG2hqj6b8iiz9rARjg2BgA9w',
            phrase: 'abuse tooth riot whale dance dawn armor patch tube sugar edit clean guilt person lake height tilt wall prosper episode produce spy artist account',
            network: 'testnet',
            version: 1
        }
    }
};

describe('Issuance Params', function () {
    before(function () {
        sdk.init({network: 'testnet'});
    });

    it('should create issuance params with valid quality', async function () {
        expect(function () {
            let account = Account.fromSeed(testData.testnet.seed);

            let quality = 10;
            let assetId = testData.testnet.existedAssetId;
            let issuanceParams = Bitmark.newIssuanceParams(assetId, quality);
            issuanceParams.sign(account);
        }).to.not.throw();
    });

    it('should create issuance params with valid nonces array', async function () {
        expect(function () {
            let account = Account.fromSeed(testData.testnet.seed);

            let assetId = testData.testnet.existedAssetId;
            let issuanceParams = Bitmark.newIssuanceParams(assetId, [1, 2, 3, 4]);
            issuanceParams.sign(account);
        }).to.not.throw();
    });

    it('should not create issuance params without asset id', function () {
        expect(function () {
            Bitmark.newIssuanceParams();
        }).to.throw();
    });

    it('should not create issuance params without quality or nonces array', function () {
        expect(function () {
            let assetId = testData.testnet.existedAssetId;
            Bitmark.newIssuanceParams(assetId);
        }).to.throw();
    });

    it('should not create issuance params with quality less than 1', function () {
        expect(function () {
            let quality = -1;
            let assetId = testData.testnet.existedAssetId;
            Bitmark.newIssuanceParams(assetId, quality);
        }).to.throw();
    });

    it('should not create issuance with quality greater than 100', function () {
        expect(function () {
            let quality = -1;
            let assetId = testData.testnet.existedAssetId;
            Bitmark.newIssuanceParams(assetId, quality);
        }).to.throw();
    });
});