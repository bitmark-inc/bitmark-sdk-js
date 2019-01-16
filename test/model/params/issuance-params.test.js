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
        network: 'testnet',
        existedAssetId: 'c54294134a632c478e978bcd7088e368828474a0d3716b884dd16c2a397edff357e76f90163061934f2c2acba1a77a5dcf6833beca000992e63e19dfaa5aee2a',
        existedBitmarkId: '889f46d55ddbf6fae2da6fe14ca31b79ab84fe7cd104de735dc8cf9319eb68b5'
    }
};

describe('Issuance Params', function () {
    let network = 'testnet';
    before(function () {
        sdk.init({network: network, apiToken: CONSTANTS.TEST_API_TOKEN});
    });

    it('should create issuance params with valid quantity', async function () {
        expect(function () {
            let account = Account.fromSeed(testData[network].seed);

            let quantity = 10;
            let assetId = testData[network].existedAssetId;
            let issuanceParams = Bitmark.newIssuanceParams(assetId, quantity);
            issuanceParams.sign(account);
        }).to.not.throw();
    });

    it('should not create issuance params without asset id', function () {
        expect(function () {
            Bitmark.newIssuanceParams();
        }).to.throw();
    });

    it('should not create issuance params without quantity', function () {
        expect(function () {
            let assetId = testData[network].existedAssetId;
            Bitmark.newIssuanceParams(assetId);
        }).to.throw();
    });

    it('should not create issuance params with quantity less than 1', function () {
        expect(function () {
            let quantity = -1;
            let assetId = testData[network].existedAssetId;
            Bitmark.newIssuanceParams(assetId, quantity);
        }).to.throw();
    });

    it('should not create issuance with quantity greater than 100', function () {
        expect(function () {
            let quantity = -1;
            let assetId = testData[network].existedAssetId;
            Bitmark.newIssuanceParams(assetId, quantity);
        }).to.throw();
    });
});