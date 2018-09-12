const chai = require('chai');
const expect = chai.expect;
const assertion = chai.assertion;

const sdk = require('../../index');
const Account = sdk.Account;
const Bitmark = sdk.Bitmark;
const common = require('../../sdk-v2/util/common');
const CONSTANTS = require('./constant/constants');
const BITMARK_CONSTANTS = require('../../sdk-v2/constant/constants');

let testData = {
    testnet: {
        seed: '5XEECt18HGBGNET1PpxLhy5CsCLG9jnmM6Q8QGF4U2yGb1DABXZsVeD',
        phrase: 'accident syrup inquiry you clutch liquid fame upset joke glow best school repeat birth library combine access camera organ trial crazy jeans lizard science',
        accountNumber: 'ec6yMcJATX6gjNwvqp8rbc4jNEasoUgbfBBGGyV5NvoJ54NXva',
        publicKey: '58760a01edf5ed4f95bfe977d77a27627cd57a25df5dea885972212c2b1c0e2f',
        network: 'testnet',
        version: 1,
        existedAssetId: '0e0b4e3bd771811d35a23707ba6197aa1dd5937439a221eaf8e7909309e7b31b6c0e06a1001c261a099abf04c560199db898bc154cf128aa9efa5efd36030c64',
        existedBitmarkIds: ['5b01acab6102c4bc134e5634d2f673a751c3e9be966e4c2961840271db170bb3', 'c1e671c92f5fdd6bebf6afa7e4a5542f555a3054972bb07a7efdccb37a052c13'],
        receiverAccount: {
            accountNumber: 'eujeF5ZBDV3qJyKeHxNqnmJsrc9iN7eHJGECsRuSXvLmnNjsWX',
            publicKey: '807f4d123c944e0c3ecc95d9bde89916ced6341a8c8cedeb8caafef8f35654e7',
            seed: '5XEECsXPYA9wDVXMtRMAVrtaWx7WSc5tG2hqj6b8iiz9rARjg2BgA9w',
            phrase: 'abuse tooth riot whale dance dawn armor patch tube sugar edit clean guilt person lake height tilt wall prosper episode produce spy artist account',
            network: 'testnet',
            version: 1
        }
    }
};

describe('Bitmark', function () {
    before(function () {
        sdk.init({network: 'testnet', apiToken: CONSTANTS.TEST_API_TOKEN});
    });

    describe('Issue Bitmarks', function () {
        this.timeout(15000);

        it('should issue bitmarks with valid quantity', async function () {
            let account = Account.fromSeed(testData.testnet.seed);

            let quantity = 10;
            let assetId = testData.testnet.existedAssetId;
            let issuanceParams = Bitmark.newIssuanceParams(assetId, quantity);
            issuanceParams.sign(account);

            let bitmarks = (await Bitmark.issue(issuanceParams)).bitmarks;
            expect(bitmarks).to.be.an('array');
            expect(bitmarks.length).to.be.equal(quantity);
            expect(bitmarks[0]).to.have.property('id');
        });

        it('should issue bitmarks with valid nonces array', async function () {
            let account = Account.fromSeed(testData.testnet.seed);

            let quantity = 10;
            let nonces = [];
            for (let i = 0; i < quantity; i++) {
                nonces.push(common.generateRandomInteger(1, Number.MAX_SAFE_INTEGER));
            }

            let assetId = testData.testnet.existedAssetId;
            let issuanceParams = Bitmark.newIssuanceParams(assetId, nonces);
            issuanceParams.sign(account);

            let bitmarks = (await Bitmark.issue(issuanceParams)).bitmarks;
            expect(bitmarks).to.be.an('array');
            expect(bitmarks.length).to.be.equal(quantity);
            expect(bitmarks[0]).to.have.property('id');
        });

        it('should not issue bitmarks with invalid asset id', function (done) {
            let account = Account.fromSeed(testData.testnet.seed);

            let quantity = 10;
            let assetId = 'fakeAssetId';
            let issuanceParams = Bitmark.newIssuanceParams(assetId, quantity);
            issuanceParams.sign(account);

            Bitmark.issue(issuanceParams).then(() => {
                assertion.fail();
                done();
            }).catch(error => {
                expect(error.response.status).to.be.equal(400);
                done();
            });
        });
    });

    describe('Query Bitmarks', function () {
        this.timeout(15000);

        describe('Query bitmarks - List', function () {
            it('should get bitmarks by owner', async function () {
                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().ownedBy(testData.testnet.accountNumber).build();
                let response = await Bitmark.list(bitmarkQueryParams);
                let bitmarks = response.bitmarks;

                expect(bitmarks).to.be.an('array');
                bitmarks.forEach((tx) => {
                    expect(tx.owner).to.be.equal(testData.testnet.accountNumber);
                });
            });

            it('should get bitmarks by issuer', async function () {
                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().issuedBy(testData.testnet.accountNumber).build();
                let response = await Bitmark.list(bitmarkQueryParams);
                let bitmarks = response.bitmarks;

                expect(bitmarks).to.be.an('array');
                bitmarks.forEach((tx) => {
                    expect(tx.issuer).to.be.equal(testData.testnet.accountNumber);
                });
            });

            it('should get bitmarks by asset id', async function () {
                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().referencedAsset(testData.testnet.existedAssetId).build();
                let response = await Bitmark.list(bitmarkQueryParams);
                let bitmarks = response.bitmarks;

                expect(bitmarks).to.be.an('array');
                bitmarks.forEach((tx) => {
                    expect(tx.asset_id).to.be.equal(testData.testnet.existedAssetId);
                });
            });

            it('should get bitmarks by offer from', async function () {
                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().offerFrom(testData.testnet.accountNumber).build();
                let response = await Bitmark.list(bitmarkQueryParams);
                let bitmarks = response.bitmarks;

                expect(bitmarks).to.be.an('array');
                bitmarks.forEach((bitmark) => {
                    expect(bitmark.offer.from).to.be.equal(testData.testnet.accountNumber);
                });
            });

            it('should get bitmarks by offer to', async function () {
                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().offerTo(testData.testnet.receiverAccount.accountNumber).build();
                let response = await Bitmark.list(bitmarkQueryParams);
                let bitmarks = response.bitmarks;

                expect(bitmarks).to.be.an('array');
                bitmarks.forEach((bitmark) => {
                    expect(bitmark.offer.to).to.be.equal(testData.testnet.receiverAccount.accountNumber);
                });
            });

            it('should get bitmarks by bitmark ids', async function () {
                let bitmarkIds = testData.testnet.existedBitmarkIds;
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
                let includeAsset = false;
                let bitmarkResponse = await Bitmark.get(bitmarkId, includeAsset);
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
                let includeAsset = true;
                let bitmarkResponse = await Bitmark.get(bitmarkId, includeAsset);
                expect(bitmarkResponse).to.have.property('bitmark');
                expect(bitmarkResponse.bitmark).to.have.property('id');
                expect(bitmarkResponse.bitmark.id).to.be.equal(bitmarkId);
                expect(bitmarkResponse).to.have.property('asset');
            });
        });
    });

    describe('Transfer Bitmarks', function () {
        this.timeout(15000);

        describe('Transfer 1 signature', function () {
            it('should transfer bitmark with valid info', async function () {
                let account = Account.fromRecoveryPhrase(testData.testnet.phrase);

                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().ownedBy(account.getAccountNumber()).pending(true).build();
                let bitmarks = (await Bitmark.list(bitmarkQueryParams)).bitmarks;
                let bitmark = bitmarks.find(bitmark => bitmark.status === 'confirmed' && bitmark.head !== 'moved' && !bitmark.offer);

                let transferParams = Bitmark.newTransferParams(testData.testnet.receiverAccount.accountNumber);
                await transferParams.fromBitmark(bitmark.id);
                transferParams.sign(account);

                let response = await Bitmark.transfer(transferParams);
                expect(response).to.have.property('txid');
            });
        });

        describe('Transfer 2 signatures', function () {
            it('should send transfer offer then accept', async function () {
                let account = Account.fromRecoveryPhrase(testData.testnet.phrase);

                // Get bitmark to transfer
                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().ownedBy(account.getAccountNumber()).pending(true).build();
                let bitmarks = (await Bitmark.list(bitmarkQueryParams)).bitmarks;
                let bitmark = bitmarks.find(bitmark => bitmark.status === 'confirmed' && bitmark.head !== 'moved' && !bitmark.offer);

                // Send transfer offer
                let receiverAccount = Account.fromSeed(testData.testnet.receiverAccount.seed);
                let transferOfferParams = Bitmark.newTransferOfferParams(receiverAccount.getAccountNumber());
                await transferOfferParams.fromBitmark(bitmark.id);
                transferOfferParams.sign(account);

                let response = await Bitmark.offer(transferOfferParams);
                expect(response).to.have.property('offer_id');

                // Response transfer offer
                let transferOfferResponseParams = Bitmark.newTransferResponseParams(BITMARK_CONSTANTS.TRANSFER_OFFER_RESPONSE_TYPES.ACCEPT);
                await transferOfferResponseParams.fromBitmark(bitmark.id);
                transferOfferResponseParams.sign(receiverAccount);

                response = await Bitmark.response(transferOfferResponseParams, receiverAccount);
                expect(response).to.have.property('txid');
            });

            it('should send transfer offer then reject', async function () {
                let account = Account.fromRecoveryPhrase(testData.testnet.phrase);

                // Get bitmark to transfer
                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().ownedBy(account.getAccountNumber()).pending(true).build();
                let bitmarks = (await Bitmark.list(bitmarkQueryParams)).bitmarks;
                let bitmark = bitmarks.find(bitmark => bitmark.status === 'confirmed' && bitmark.head !== 'moved' && !bitmark.offer);

                // Send transfer offer
                let receiverAccount = Account.fromSeed(testData.testnet.receiverAccount.seed);
                let transferOfferParams = Bitmark.newTransferOfferParams(receiverAccount.getAccountNumber());
                await transferOfferParams.fromBitmark(bitmark.id);
                transferOfferParams.sign(account);

                let response = await Bitmark.offer(transferOfferParams);
                expect(response).to.have.property('offer_id');

                // Response transfer offer
                let transferOfferResponseParams = Bitmark.newTransferResponseParams(BITMARK_CONSTANTS.TRANSFER_OFFER_RESPONSE_TYPES.REJECT);
                await transferOfferResponseParams.fromBitmark(bitmark.id);

                response = await Bitmark.response(transferOfferResponseParams, receiverAccount);
                expect(response).to.have.property('status');
                expect(response.status).to.be.equal('ok');
            });

            it('should send transfer offer then cancel', async function () {
                let account = Account.fromRecoveryPhrase(testData.testnet.phrase);

                // Get bitmark to transfer
                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().ownedBy(account.getAccountNumber()).pending(true).build();
                let bitmarks = (await Bitmark.list(bitmarkQueryParams)).bitmarks;
                let bitmark = bitmarks.find(bitmark => bitmark.status === 'confirmed' && bitmark.head !== 'moved' && !bitmark.offer);

                // Send transfer offer
                let receiverAccount = Account.fromSeed(testData.testnet.receiverAccount.seed);
                let transferOfferParams = Bitmark.newTransferOfferParams(receiverAccount.getAccountNumber());
                await transferOfferParams.fromBitmark(bitmark.id);
                transferOfferParams.sign(account);

                let response = await Bitmark.offer(transferOfferParams);
                expect(response).to.have.property('offer_id');

                // Response transfer offer
                let transferOfferResponseParams = Bitmark.newTransferResponseParams(BITMARK_CONSTANTS.TRANSFER_OFFER_RESPONSE_TYPES.CANCEL);
                await transferOfferResponseParams.fromBitmark(bitmark.id);

                response = await Bitmark.response(transferOfferResponseParams, account);
                expect(response).to.have.property('status');
                expect(response.status).to.be.equal('ok');
            });
        });
    });
});