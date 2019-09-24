const chai = require('chai');
const expect = chai.expect;
const assertion = chai.assertion;
const fs = require('fs');

const sdk = require('../../index');
const Account = sdk.Account;
const Bitmark = sdk.Bitmark;
const Asset = sdk.Asset;
const CONSTANTS = require('../constant/constants');
const BITMARK_CONSTANTS = require('../../sdk/constant/constants');
const common = require('../../sdk/util/common');

let testData = {
    testnet: {
        seed: '9J87CAsHdFdoEu6N1unZk3sqhVBkVL8Z8',
        phrase: 'name gaze apart lamp lift zone believe steak session laptop crowd hill',
        accountNumber: 'eMCcmw1SKoohNUf3LeioTFKaYNYfp2bzFYpjm3EddwxBSWYVCb',
        publicKey: '369f6ceb1c23dbccc61b75e7990d0b2db8e1ee8da1c44db32280e63ca5804f38',
        network: 'testnet',
        existedAssetId: 'c54294134a632c478e978bcd7088e368828474a0d3716b884dd16c2a397edff357e76f90163061934f2c2acba1a77a5dcf6833beca000992e63e19dfaa5aee2a',
        existedBitmarkIds: ['889f46d55ddbf6fae2da6fe14ca31b79ab84fe7cd104de735dc8cf9319eb68b5', '0d9a70dbad56820ac538417be3cacdcb643f295a1f2cf4812ad9fb4b56818221'],
        receiverAccount: {
            seed: '9J87CMoXoKo5CtSauY27xhMffEsWxVJJF',
            phrase: 'noise tree today erosion symbol cloth slogan fiber acoustic moon tip deposit',
            accountNumber: 'ezsdHvtQVFhA6JSPSyQZjsSD5UPcBycyrpmTnSAwZsUeujKbSG',
            publicKey: '8c29b5b58f5e1905b4ea3ac00da6cf0148d39ef3b83be35d81421a7dc8a93eea',
            network: 'testnet'
        }
    }
};

describe('Bitmark', function () {
    let network = 'testnet';
    before(function () {
        sdk.init({network: network, apiToken: CONSTANTS.TEST_API_TOKEN});
    });

    describe('Issue Bitmarks', function () {
        this.timeout(30000);

        it('should issue bitmarks with valid quantity and existing asset', async function () {
            let account = Account.fromSeed(testData[network].seed);

            let quantity = 10;
            let assetId = testData[network].existedAssetId;
            let issuanceParams = Bitmark.newIssuanceParams(assetId, quantity);
            issuanceParams.sign(account);

            let bitmarks = (await Bitmark.issue(issuanceParams)).bitmarks;
            expect(bitmarks).to.be.an('array');
            expect(bitmarks.length).to.be.equal(quantity);
            expect(bitmarks[0]).to.have.property('id');
        });

        it('should issue bitmarks with valid quantity and new asset', async function () {
            let account = Account.fromSeed(testData[network].seed);

            // Register new asset
            let testFile = './test/tmp/myfile.test';
            fs.writeFileSync(testFile, common.generateRandomBytesByLength(1000));

            let registrationParams = Asset.newRegistrationParams('name', {});
            await registrationParams.setFingerprint(testFile);
            registrationParams.sign(account);

            let assetResponse = (await Asset.register(registrationParams)).assets;
            fs.unlinkSync(testFile);

            expect(assetResponse).to.be.an('array');
            expect(assetResponse[0]).to.have.property('id');

            // Issue bitmarks
            let quantity = 10;
            let assetId = assetResponse[0].id;
            let issuanceParams = Bitmark.newIssuanceParams(assetId, quantity);
            issuanceParams.sign(account);

            let bitmarks = (await Bitmark.issue(issuanceParams)).bitmarks;
            expect(bitmarks).to.be.an('array');
            expect(bitmarks.length).to.be.equal(quantity);
            expect(bitmarks[0]).to.have.property('id');
        });

        it('should not issue bitmarks with invalid asset id', function (done) {
            let account = Account.fromSeed(testData[network].seed);

            let quantity = 10;
            let assetId = 'fakeAssetId';
            let issuanceParams = Bitmark.newIssuanceParams(assetId, quantity);
            issuanceParams.sign(account);

            Bitmark.issue(issuanceParams).then(() => {
                assertion.fail();
                done();
            }).catch(error => {
                expect(error.response.status).to.be.equal(404);
                done();
            });
        });
    });

    describe('Query Bitmarks', function () {
        this.timeout(30000);

        describe('Query bitmarks - List', function () {
            it('should get bitmarks by owner', async function () {
                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().ownedBy(testData[network].accountNumber).build();
                let response = await Bitmark.list(bitmarkQueryParams);
                let bitmarks = response.bitmarks;

                expect(bitmarks).to.be.an('array');
                bitmarks.forEach((tx) => {
                    expect(tx.owner).to.be.equal(testData[network].accountNumber);
                });
            });

            it('should get bitmarks by issuer', async function () {
                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().issuedBy(testData[network].accountNumber).build();
                let response = await Bitmark.list(bitmarkQueryParams);
                let bitmarks = response.bitmarks;

                expect(bitmarks).to.be.an('array');
                bitmarks.forEach((tx) => {
                    expect(tx.issuer).to.be.equal(testData[network].accountNumber);
                });
            });

            it('should get bitmarks by asset id', async function () {
                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().referencedAsset(testData[network].existedAssetId).build();
                let response = await Bitmark.list(bitmarkQueryParams);
                let bitmarks = response.bitmarks;

                expect(bitmarks).to.be.an('array');
                bitmarks.forEach((tx) => {
                    expect(tx.asset_id).to.be.equal(testData[network].existedAssetId);
                });
            });

            it('should get bitmarks by offer from', async function () {
                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().offerFrom(testData[network].accountNumber).build();
                let response = await Bitmark.list(bitmarkQueryParams);
                let bitmarks = response.bitmarks;

                expect(bitmarks).to.be.an('array');
                bitmarks.forEach((bitmark) => {
                    expect(bitmark.offer.from).to.be.equal(testData[network].accountNumber);
                });
            });

            it('should get bitmarks by offer to', async function () {
                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().offerTo(testData[network].receiverAccount.accountNumber).build();
                let response = await Bitmark.list(bitmarkQueryParams);
                let bitmarks = response.bitmarks;

                expect(bitmarks).to.be.an('array');
                bitmarks.forEach((bitmark) => {
                    expect(bitmark.offer.to).to.be.equal(testData[network].receiverAccount.accountNumber);
                });
            });

            it('should get bitmarks by bitmark ids', async function () {
                let bitmarkIds = testData[network].existedBitmarkIds;
                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().bitmarkIds(bitmarkIds).build();
                let response = await Bitmark.list(bitmarkQueryParams);
                let bitmarks = response.bitmarks;
                expect(bitmarks).to.be.an('array');
                expect(bitmarks.length).to.be.equal(bitmarkIds.length);
                bitmarks.forEach((bitmark) => {
                    expect(bitmarkIds.includes(bitmark.id)).to.be.equal(true);
                });
            });

            it('should get bitmarks with assets', async function () {
                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().loadAsset(true).build();
                let response = await Bitmark.list(bitmarkQueryParams);
                expect(response.bitmarks).to.be.an('array');
                expect(response.assets).to.be.an('array');
            });

            it('should get bitmarks with limit', async function () {
                let limit = 1;
                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().limit(limit).build();
                let response = await Bitmark.list(bitmarkQueryParams);
                expect(response.bitmarks).to.be.an('array');
                expect(response.bitmarks.length).to.be.equal(limit);
            });

            it('should get bitmarks with at and to (later)', async function () {
                let limit = 10;
                let at = 5;
                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().at(at).to(BITMARK_CONSTANTS.QUERY_TO_DIRECTIONS.LATER).limit(limit).build();
                let response = await Bitmark.list(bitmarkQueryParams);
                let bitmarks = response.bitmarks;
                expect(bitmarks).to.be.an('array');
                bitmarks.forEach((bitmark) => {
                    expect(bitmark.offset >= at);
                });
            });

            it('should get bitmarks with at and to (earlier)', async function () {
                let limit = 10;
                let at = 5;
                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().at(at).to(BITMARK_CONSTANTS.QUERY_TO_DIRECTIONS.EARLIER).limit(limit).build();
                let response = await Bitmark.list(bitmarkQueryParams);
                let bitmarks = response.bitmarks;
                expect(bitmarks).to.be.an('array');
                bitmarks.forEach((bitmark) => {
                    expect(bitmark.offset <= at);
                });
            });
        });

        describe('Query bitmark - Get', function () {
            it('should get bitmark by id', async function () {
                let limit = 1;
                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().limit(limit).build();
                let bitmarksResponse = await Bitmark.list(bitmarkQueryParams);
                expect(bitmarksResponse.bitmarks).to.be.an('array');
                expect(bitmarksResponse.bitmarks.length).to.be.equal(limit);

                let bitmarkId = bitmarksResponse.bitmarks[0].id;
                let bitmarkResponse = await Bitmark.get(bitmarkId);
                expect(bitmarkResponse).to.have.property('bitmark');
                expect(bitmarkResponse.bitmark).to.have.property('id');
                expect(bitmarkResponse.bitmark.id).to.be.equal(bitmarkId);
            });

            it('should get bitmark by id without asset ', async function () {
                let limit = 1;
                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().limit(limit).build();
                let bitmarksResponse = await Bitmark.list(bitmarkQueryParams);
                expect(bitmarksResponse.bitmarks).to.be.an('array');
                expect(bitmarksResponse.bitmarks.length).to.be.equal(limit);

                let bitmarkId = bitmarksResponse.bitmarks[0].id;
                let bitmarkResponse = await Bitmark.get(bitmarkId);
                expect(bitmarkResponse).to.have.property('bitmark');
                expect(bitmarkResponse.bitmark).to.have.property('id');
                expect(bitmarkResponse.bitmark.id).to.be.equal(bitmarkId);
                expect(bitmarkResponse).to.not.have.property('asset');
            });

            it('should get bitmark by id with asset ', async function () {
                let limit = 1;
                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().limit(limit).build();
                let bitmarksResponse = await Bitmark.list(bitmarkQueryParams);
                expect(bitmarksResponse.bitmarks).to.be.an('array');
                expect(bitmarksResponse.bitmarks.length).to.be.equal(limit);

                let bitmarkId = bitmarksResponse.bitmarks[0].id;
                let bitmarkResponse = await Bitmark.getWithAsset(bitmarkId);
                expect(bitmarkResponse).to.have.property('bitmark');
                expect(bitmarkResponse.bitmark).to.have.property('id');
                expect(bitmarkResponse.bitmark.id).to.be.equal(bitmarkId);
                expect(bitmarkResponse).to.have.property('asset');
            });
        });
    });

    describe('Transfer Bitmarks', function () {
        this.timeout(30000);

        describe('Transfer 1 signature', function () {
            it('should transfer bitmark with valid info', async function () {
                let account = Account.fromRecoveryPhrase(testData[network].phrase);

                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().ownedBy(account.getAccountNumber()).pending(true).build();
                let bitmarks = (await Bitmark.list(bitmarkQueryParams)).bitmarks;
                let bitmark = bitmarks.find(bitmark => bitmark.status === BITMARK_CONSTANTS.BITMARK_STATUSES.SETTLED && bitmark.head !== 'moved' && !bitmark.offer);

                let transferParams = Bitmark.newTransferParams(testData[network].receiverAccount.accountNumber);
                await transferParams.fromBitmark(bitmark.id);
                transferParams.sign(account);

                let response = await Bitmark.transfer(transferParams);
                expect(response).to.have.property('txid');
            });
        });

        describe('Transfer 2 signatures', function () {
            it('should send transfer offer then accept', async function () {
                let account = Account.fromRecoveryPhrase(testData[network].phrase);

                // Get bitmark to transfer
                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().ownedBy(account.getAccountNumber()).pending(true).build();
                let bitmarks = (await Bitmark.list(bitmarkQueryParams)).bitmarks;
                let bitmark = bitmarks.find(bitmark => bitmark.status === BITMARK_CONSTANTS.BITMARK_STATUSES.SETTLED && bitmark.head !== 'moved' && !bitmark.offer);

                // Send transfer offer
                let receiverAccount = Account.fromSeed(testData[network].receiverAccount.seed);
                let transferOfferParams = Bitmark.newTransferOfferParams(receiverAccount.getAccountNumber());
                await transferOfferParams.fromBitmark(bitmark.id);
                transferOfferParams.sign(account);

                let response = await Bitmark.offer(transferOfferParams);
                expect(response).to.have.property('offer_id');

                // Response transfer offer
                let transferOfferResponseParams = Bitmark.newTransferResponseParams(BITMARK_CONSTANTS.TRANSFER_OFFER_RESPONSE_TYPES.ACCEPT);
                await transferOfferResponseParams.fromBitmark(bitmark.id);
                transferOfferResponseParams.sign(receiverAccount);

                response = await Bitmark.respond(transferOfferResponseParams, receiverAccount);
                expect(response).to.have.property('txid');
            });

            it('should send transfer offer then reject', async function () {
                let account = Account.fromRecoveryPhrase(testData[network].phrase);

                // Get bitmark to transfer
                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().ownedBy(account.getAccountNumber()).pending(true).build();
                let bitmarks = (await Bitmark.list(bitmarkQueryParams)).bitmarks;
                let bitmark = bitmarks.find(bitmark => bitmark.status === BITMARK_CONSTANTS.BITMARK_STATUSES.SETTLED && bitmark.head !== 'moved' && !bitmark.offer);

                // Send transfer offer
                let receiverAccount = Account.fromSeed(testData[network].receiverAccount.seed);
                let transferOfferParams = Bitmark.newTransferOfferParams(receiverAccount.getAccountNumber());
                await transferOfferParams.fromBitmark(bitmark.id);
                transferOfferParams.sign(account);

                let response = await Bitmark.offer(transferOfferParams);
                expect(response).to.have.property('offer_id');

                // Response transfer offer
                let transferOfferResponseParams = Bitmark.newTransferResponseParams(BITMARK_CONSTANTS.TRANSFER_OFFER_RESPONSE_TYPES.REJECT);
                await transferOfferResponseParams.fromBitmark(bitmark.id);

                response = await Bitmark.respond(transferOfferResponseParams, receiverAccount);
                expect(response).to.have.property('status');
                expect(response.status).to.be.equal('ok');
            });

            it('should send transfer offer then cancel', async function () {
                let account = Account.fromRecoveryPhrase(testData[network].phrase);

                // Get bitmark to transfer
                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().ownedBy(account.getAccountNumber()).pending(true).build();
                let bitmarks = (await Bitmark.list(bitmarkQueryParams)).bitmarks;
                let bitmark = bitmarks.find(bitmark => bitmark.status === BITMARK_CONSTANTS.BITMARK_STATUSES.SETTLED && bitmark.head !== 'moved' && !bitmark.offer);

                // Send transfer offer
                let receiverAccount = Account.fromSeed(testData[network].receiverAccount.seed);
                let transferOfferParams = Bitmark.newTransferOfferParams(receiverAccount.getAccountNumber());
                await transferOfferParams.fromBitmark(bitmark.id);
                transferOfferParams.sign(account);

                let response = await Bitmark.offer(transferOfferParams);
                expect(response).to.have.property('offer_id');

                // Response transfer offer
                let transferOfferResponseParams = Bitmark.newTransferResponseParams(BITMARK_CONSTANTS.TRANSFER_OFFER_RESPONSE_TYPES.CANCEL);
                await transferOfferResponseParams.fromBitmark(bitmark.id);

                response = await Bitmark.respond(transferOfferResponseParams, account);
                expect(response).to.have.property('status');
                expect(response.status).to.be.equal('ok');
            });
        });
    });
});