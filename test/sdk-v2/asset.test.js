const chai = require('chai');
const expect = chai.expect;
const assertion = chai.assertion;
const fs = require('fs');

const sdk = require('../../index');
const common = require('../../sdk-v2/util/common');
const Account = sdk.Account;
const Asset = sdk.Asset;
const CONSTANTS = require('./constant/constants');

let testData = {
    testnet: {
        seed: '5XEECt18HGBGNET1PpxLhy5CsCLG9jnmM6Q8QGF4U2yGb1DABXZsVeD',
        phrase: 'accident syrup inquiry you clutch liquid fame upset joke glow best school repeat birth library combine access camera organ trial crazy jeans lizard science',
        accountNumber: 'ec6yMcJATX6gjNwvqp8rbc4jNEasoUgbfBBGGyV5NvoJ54NXva',
        publicKey: '58760a01edf5ed4f95bfe977d77a27627cd57a25df5dea885972212c2b1c0e2f',
        network: 'testnet',
        version: 1
    },
    livenet: {
        seed: '5XEECqWqA47qWg86DR5HJ29HhbVqwigHUAhgiBMqFSBycbiwnbY639s',
        phrase: 'ability panel leave spike mixture token voice certain today market grief crater cruise smart camera palm wheat rib swamp labor bid rifle piano glass',
        accountNumber: 'bDnC8nCaupb1AQtNjBoLVrGmobdALpBewkyYRG7kk2euMG93Bf',
        publicKey: '9aaf14f906e2be86b32eae1b206335e73646e51f8bf29b6bc580b1d5a0be67b1',
        network: 'livenet',
        version: 1
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
            let testFile = './test/sdk-v2/tmp/myfile.test';
            fs.writeFileSync(testFile, common.generateRandomBytesByLength(1000));

            let registrationParams = Asset.newRegistrationParams('name', {author: 'test'});
            await registrationParams.setFingerprint(testFile);
            registrationParams.sign(account);

            let response = await Asset.register(registrationParams);
            fs.unlinkSync(testFile);

            expect(response).to.be.an('array');
            expect(response[0]).to.have.property('id');
            expect(response[0].duplicate).to.be.equal(false);
        });

        it('should register existing asset', async function () {
            let account = Account.fromSeed(testData.testnet.seed);
            let testFile = './test/sdk-v2/tmp/undelete.test';

            let registrationParams = Asset.newRegistrationParams('name', {author: 'test'});
            await registrationParams.setFingerprint(testFile);
            registrationParams.sign(account);

            let response = await Asset.register(registrationParams);
            expect(response).to.be.an('array');
            expect(response[0]).to.have.property('id');
            expect(response[0].duplicate).to.be.equal(true);
        });

        it('should not re-register existing asset with different asset name', async function () {
            let account = Account.fromSeed(testData.testnet.seed);
            let testFile = './test/sdk-v2/tmp/undelete.test';

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
            let testFile = './test/sdk-v2/tmp/undelete.test';

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