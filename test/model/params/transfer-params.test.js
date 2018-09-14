const chai = require('chai');
const expect = chai.expect;

const sdk = require('../../../index');
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
        version: 1
    }
};

describe('Transfer Params', function () {
    before(function () {
        sdk.init({network: 'testnet', apiToken: CONSTANTS.TEST_API_TOKEN});
    });

    it('should create transfer params with valid account number', async function () {
        expect(function () {
            let account = Account.fromSeed(testData.testnet.seed);
            Bitmark.newTransferParams(account.getAccountNumber());
        }).to.not.throw();
    });

    it('should not create transfer params with invalid account number', async function () {
        expect(function () {
            let accountNumber = 1;
            Bitmark.newTransferParams(accountNumber);
        }).to.throw();
    });

    it('should not create transfer params without account number', async function () {
        expect(function () {
            Bitmark.newTransferParams();
        }).to.throw();
    });
});