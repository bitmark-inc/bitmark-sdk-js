const chai = require('chai');
const expect = chai.expect;

const sdk = require('../../../../index');
const Account = sdk.Account;
const Bitmark = sdk.Bitmark;
const CONSTANTS = require('../../constant/constants');

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

describe('Transfer Offer Params', function () {
    before(function () {
        sdk.init({network: 'testnet', apiToken: CONSTANTS.TEST_API_TOKEN});
    });

    it('should create transfer offer params with valid account number', async function () {
        expect(function () {
            let account = Account.fromSeed(testData.testnet.seed);
            Bitmark.newTransferOfferParams(account.getAccountNumber());
        }).to.not.throw();
    });

    it('should not create transfer offer params with invalid account number', async function () {
        expect(function () {
            let accountNumber = 1;
            Bitmark.newTransferOfferParams(accountNumber);
        }).to.throw();
    });

    it('should not create transfer offer params without account number', async function () {
        expect(function () {
            Bitmark.newTransferOfferParams();
        }).to.throw();
    });
});