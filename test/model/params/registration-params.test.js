const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');

const sdk = require('../../../index');
const Account = sdk.Account;
const Asset = sdk.Asset;
const common = require('../../../sdk/util/common');
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

describe('Registration Params', function () {
    let network = 'testnet';
    before(function () {
        sdk.init({network: network, apiToken: CONSTANTS.TEST_API_TOKEN});
    });

    it('should create registration params with valid info', function () {
        expect(function () {
            Asset.newRegistrationParams('name', {author: 'test'});
        }).to.not.throw();
    });

    it('should not create registration params without asset name', async function () {
        expect(function () {
            Asset.newRegistrationParams({author: 'test'});
        }).to.throw();
    });

    it('should not create registration params with too long asset name', async function () {
        expect(function () {
            Asset.newRegistrationParams('too long name too long name too long name too long name too long name too long name', {author: 'test'});
        }).to.throw();
    });

    it('should not create registration params without metadata', async function () {
        expect(function () {
            Asset.newRegistrationParams('name');
        }).to.throw();
    });

    it('should not create registration params with too long metadata', async function () {
        expect(function () {
            Asset.newRegistrationParams('name', {author: 'too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name too long name'});
        }).to.throw();
    });

    it('should set fingerprint with valid info', async function () {
        let account = Account.fromSeed(testData[network].seed);
        let testFile = './test/tmp/myfile.test';
        fs.writeFileSync(testFile, common.generateRandomBytesByLength(1000));

        let registrationParams = Asset.newRegistrationParams('name', {author: 'test'});
        await registrationParams.setFingerprint(testFile);
        registrationParams.sign(account);

        fs.unlinkSync(testFile);
    });
});