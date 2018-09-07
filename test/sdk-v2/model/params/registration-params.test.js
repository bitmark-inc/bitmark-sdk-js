const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');

const sdk = require('../../../../index');
const Account = sdk.Account;
const Asset = sdk.Asset;
const common = require('../../../../sdk-v2/util/common');
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

describe('Registration Params', function () {
    before(function () {
        sdk.init({network: 'testnet', apiToken: CONSTANTS.TEST_API_TOKEN});
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
        let account = Account.fromSeed(testData.testnet.seed);
        let testFile = './test/sdk-v2/tmp/myfile.test';
        fs.writeFileSync(testFile, common.generateRandomBytesByLength(1000));

        let registrationParams = Asset.newRegistrationParams('name', {author: 'test'});
        await registrationParams.setFingerprint(testFile);
        registrationParams.sign(account);

        fs.unlinkSync(testFile);
    });
});