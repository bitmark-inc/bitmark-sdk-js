const chai = require('chai');
const expect = chai.expect;

const sdk = require('../../../index');
const Account = sdk.Account;
const Bitmark = sdk.Bitmark;
const CONSTANTS = require('../../constant/constants');

let testData = {
    testnet: {
        seed: '9J87CAsHdFdoEu6N1unZk3sqhVBkVL8Z8',
        phrase: 'name gaze apart lamp lift zone believe steak session laptop crowd hill',
        accountNumber: 'eMCcmw1SKoohNUf3LeioTFKaYNYfp2bzFYpjm3EddwxBSWYVCb',
        publicKey: '369f6ceb1c23dbccc61b75e7990d0b2db8e1ee8da1c44db32280e63ca5804f38',
        network: 'testnet'
    }
};

describe('Transfer Params', function () {
    let network = 'testnet';
    before(function () {
        sdk.init({network: network, apiToken: CONSTANTS.TEST_API_TOKEN});
    });

    it('should create transfer params with valid account number', async function () {
        expect(function () {
            let account = Account.fromSeed(testData[network].seed);
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