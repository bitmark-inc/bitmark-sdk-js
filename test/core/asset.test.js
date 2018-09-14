const chai = require('chai');
const expect = chai.expect;
const assertion = chai.assertion;
const fs = require('fs');

const sdk = require('../../index');
const common = require('../../sdk/util/common');
const Account = sdk.Account;
const Asset = sdk.Asset;
const CONSTANTS = require('../constant/constants');

let testData = {
    testnet: {
        seed: '5XEECt18HGBGNET1PpxLhy5CsCLG9jnmM6Q8QGF4U2yGb1DABXZsVeD',
        phrase: 'accident syrup inquiry you clutch liquid fame upset joke glow best school repeat birth library combine access camera organ trial crazy jeans lizard science',
        accountNumber: 'ec6yMcJATX6gjNwvqp8rbc4jNEasoUgbfBBGGyV5NvoJ54NXva',
        publicKey: '58760a01edf5ed4f95bfe977d77a27627cd57a25df5dea885972212c2b1c0e2f',
        network: 'testnet',
        version: 1,
        existedAssetIds: ['0e0b4e3bd771811d35a23707ba6197aa1dd5937439a221eaf8e7909309e7b31b6c0e06a1001c261a099abf04c560199db898bc154cf128aa9efa5efd36030c64', '0d8fc4a5dbc11b21528dd61fde427fbc89087bb591102b284fd5360d127fa80592ef5e5ad93c61db7e0fb88f66dfe7c02e68905f78a3734446b2fa299d79ae98']
    }
};

describe('Asset', function () {
    before(function () {
        sdk.init({network: 'testnet', apiToken: CONSTANTS.TEST_API_TOKEN});
    });

    describe('Register Asset', function () {
        this.timeout(15000);

        it('should register new asset', async function () {
            let account = Account.fromSeed(testData.testnet.seed);
            let testFile = './test/tmp/myfile.test';
            fs.writeFileSync(testFile, common.generateRandomBytesByLength(1000));

            let registrationParams = Asset.newRegistrationParams('name', {});
            await registrationParams.setFingerprint(testFile);
            registrationParams.sign(account);

            let response = (await Asset.register(registrationParams)).assets;
            fs.unlinkSync(testFile);

            expect(response).to.be.an('array');
            expect(response[0]).to.have.property('id');
            expect(response[0].duplicate).to.be.equal(false);
        });

        it('should register existing asset', async function () {
            let account = Account.fromSeed(testData.testnet.seed);
            let testFile = './test/tmp/undelete.test';

            let registrationParams = Asset.newRegistrationParams('name', {author: 'test'});
            await registrationParams.setFingerprint(testFile);
            registrationParams.sign(account);

            let response = (await Asset.register(registrationParams)).assets;
            expect(response).to.be.an('array');
            expect(response[0]).to.have.property('id');
            expect(response[0].duplicate).to.be.equal(true);
        });

        it('should not re-register existing asset with different asset name', async function () {
            let account = Account.fromSeed(testData.testnet.seed);
            let testFile = './test/tmp/undelete.test';

            let registrationParams = Asset.newRegistrationParams('another name', {author: 'test'});
            await registrationParams.setFingerprint(testFile);
            registrationParams.sign(account);

            try {
                await Asset.register(registrationParams);
                assertion.fail();
            } catch (error) {
                expect(error.response.status).to.be.equal(403);
            }
        });

        it('should not re-register existing asset with different metadata name', async function () {
            let account = Account.fromSeed(testData.testnet.seed);
            let testFile = './test/tmp/undelete.test';

            let registrationParams = Asset.newRegistrationParams('name', {author: 'test', new_attribute: 'new_attribute'});
            await registrationParams.setFingerprint(testFile);
            registrationParams.sign(account);

            try {
                await Asset.register(registrationParams);
                assertion.fail();
            } catch (error) {
                expect(error.response.status).to.be.equal(403);
            }
        });
    });

    describe('Query Asset', function () {
        this.timeout(15000);

        describe('Query assets - List', function () {
            it('should get assets by registrant', async function () {
                let assetQueryParams = Asset.newAssetQueryBuilder().registeredBy(testData.testnet.accountNumber).build();
                let response = await Asset.list(assetQueryParams);
                let assets = response.assets;

                expect(assets).to.be.an('array');
                assets.forEach((tx) => {
                    expect(tx.registrant).to.be.equal(testData.testnet.accountNumber);
                });
            });

            it('should get assets with limit', async function () {
                let limit = 1;
                let assetQueryParams = Asset.newAssetQueryBuilder().limit(limit).build();
                let response = await Asset.list(assetQueryParams);
                expect(response.assets).to.be.an('array');
                expect(response.assets.length).to.be.equal(limit);
            });

            it('should get assets by asset ids', async function () {
                let assetIds = testData.testnet.existedAssetIds;
                let assetQueryParams = Asset.newAssetQueryBuilder().assetIds(assetIds).build();
                let response = await Asset.list(assetQueryParams);
                let assets = response.assets;
                expect(assets).to.be.an('array');
                expect(assets.length).to.be.equal(assetIds.length);
                assets.forEach((asset) => {
                    expect(assetIds.includes(asset.id)).to.be.equal(true);
                });
            });
        });

        describe('Query asset - Get', function () {
            it('should get asset by id', async function () {
                let limit = 1;
                let assetQueryParams = Asset.newAssetQueryBuilder().limit(limit).build();
                let assetsResponse = await Asset.list(assetQueryParams);
                expect(assetsResponse.assets).to.be.an('array');
                expect(assetsResponse.assets.length).to.be.equal(limit);

                let assetId = assetsResponse.assets[0].id;
                let assetResponse = await Asset.get(assetId);
                expect(assetResponse).to.have.property('asset');
                expect(assetResponse.asset).to.have.property('id');
                expect(assetResponse.asset.id).to.be.equal(assetId);
            });
        });
    });
});