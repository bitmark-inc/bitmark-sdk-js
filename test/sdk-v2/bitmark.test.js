const chai = require('chai');
const expect = chai.expect;

const sdk = require('../../index');
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
        existedAssetId: '0e0b4e3bd771811d35a23707ba6197aa1dd5937439a221eaf8e7909309e7b31b6c0e06a1001c261a099abf04c560199db898bc154cf128aa9efa5efd36030c64'
    }
};

describe('Bitmark', function () {
    describe('Issue Bitmarks', function () {
        before(function () {
            sdk.init({network: 'testnet'});
        });

        this.timeout(15000);

        it('should issue bitmarks with valid quality', async function () {
            let account = Account.fromSeed(testData.testnet.seed);

            let quality = 10;
            let assetId = testData.testnet.existedAssetId;
            let issuanceParams = Bitmark.newIssuanceParams(assetId, quality);
            issuanceParams.sign(account);

            let bitmarks = await Bitmark.issue(issuanceParams);
            expect(bitmarks.length).to.be.equal(quality);
        });

        it('should not issue bitmarks with invalid quality', function () {
            expect(function () {
                let account = Account.fromSeed(testData.testnet.seed);

                let quality = -1;
                let assetId = testData.testnet.existedAssetId;
                let issuanceParams = Bitmark.newIssuanceParams(assetId, quality);
                issuanceParams.sign(account);

                Bitmark.issue(issuanceParams);
            }).to.throw();
        });

        it('should not issue number of bitmarks greater than 100', function () {
            expect(function () {
                let account = Account.fromSeed(testData.testnet.seed);

                let quality = 101;
                let assetId = testData.testnet.existedAssetId;
                let issuanceParams = Bitmark.newIssuanceParams(assetId, quality);
                issuanceParams.sign(account);

                Bitmark.issue(issuanceParams);
            }).to.throw();
        });
    });
});