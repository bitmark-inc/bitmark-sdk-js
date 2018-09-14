const chai = require('chai');
const expect = chai.expect;

const sdk = require('../../../index');
const Bitmark = sdk.Bitmark;
const CONSTANTS = require('../../constant/constants');

describe('Transfer Offer Response Params', function () {
    before(function () {
        sdk.init({network: 'testnet', apiToken: CONSTANTS.TEST_API_TOKEN});
    });

    it('should create transfer offer response params with valid response type', async function () {
        expect(function () {
            Bitmark.newTransferResponseParams('accept');
        }).to.not.throw();
    });

    it('should not create transfer params with invalid response type', async function () {
        expect(function () {
            Bitmark.newTransferResponseParams('invalidResponseType');
        }).to.throw();
    });
});