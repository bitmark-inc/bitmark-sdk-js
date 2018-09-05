const chai = require('chai');
const expect = chai.expect;

const sdk = require('../../index');
const Account = sdk.Account;
const Bitmark = sdk.Bitmark;
const common = require('../../sdk-v2/util/common');

let testData = {
    testnet: {
        seed: '5XEECt18HGBGNET1PpxLhy5CsCLG9jnmM6Q8QGF4U2yGb1DABXZsVeD',
        phrase: 'accident syrup inquiry you clutch liquid fame upset joke glow best school repeat birth library combine access camera organ trial crazy jeans lizard science',
        accountNumber: 'ec6yMcJATX6gjNwvqp8rbc4jNEasoUgbfBBGGyV5NvoJ54NXva',
        publicKey: '58760a01edf5ed4f95bfe977d77a27627cd57a25df5dea885972212c2b1c0e2f',
        network: 'testnet',
        version: 1,
        existedAssetId: '0e0b4e3bd771811d35a23707ba6197aa1dd5937439a221eaf8e7909309e7b31b6c0e06a1001c261a099abf04c560199db898bc154cf128aa9efa5efd36030c64',
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
        sdk.init({network: 'testnet'});
    });

    describe('Issue Bitmarks', function () {
        this.timeout(15000);

        it('should issue bitmarks with valid quantity', async function () {
            let account = Account.fromSeed(testData.testnet.seed);

            let quantity = 10;
            let assetId = testData.testnet.existedAssetId;
            let issuanceParams = Bitmark.newIssuanceParams(assetId, quantity);
            issuanceParams.sign(account);

            let bitmarks = await Bitmark.issue(issuanceParams);
            expect(bitmarks.length).to.be.equal(quantity);
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

            let bitmarks = await Bitmark.issue(issuanceParams);
            expect(bitmarks.length).to.be.equal(quantity);
        });

        it('should issue bitmarks with invalid asset id', async function () {
            let account = Account.fromSeed(testData.testnet.seed);

            let quantity = 10;
            let nonces = [];
            for (let i = 0; i < quantity; i++) {
                nonces.push(common.generateRandomInteger(1, Number.MAX_SAFE_INTEGER));
            }

            let assetId = testData.testnet.existedAssetId;
            let issuanceParams = Bitmark.newIssuanceParams(assetId, nonces);
            issuanceParams.sign(account);

            let bitmarks = await Bitmark.issue(issuanceParams);
            expect(bitmarks.length).to.be.equal(quantity);
        });
    });

    describe('Transfer Bitmarks', function () {
        this.timeout(15000);

        describe('Transfer 1 signature', function () {
            it('should transfer bitmark with valid info', async function () {
                let account = Account.fromRecoveryPhrase(testData.testnet.phrase);

                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().owner(account.getAccountNumber()).pending(true).build();
                let bitmarks = await Bitmark.list(bitmarkQueryParams);
                let bitmark = bitmarks.find(bitmark => bitmark.status === 'confirmed' && bitmark.head !== 'moved');

                let transferParams = Bitmark.newTransferParams(testData.testnet.receiverAccount.accountNumber);
                await transferParams.fromBitmark(bitmark.id);
                transferParams.sign(account);

                let response = await Bitmark.transfer(transferParams);
                expect(response).to.be.an('array');
                expect(response[0]).to.have.property('txid');
            });
        });

        describe('Transfer 2 signatures', function () {
            it('should send transfer offer then accept', async function () {
                let account = Account.fromRecoveryPhrase(testData.testnet.phrase);

                let transferOffers = await Bitmark.getTransferOffers(account.getAccountNumber());
                let yourTransferOffers = transferOffers.from;

                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().owner(account.getAccountNumber()).pending(true).build();
                let bitmarks = await Bitmark.list(bitmarkQueryParams);
                let bitmark = bitmarks.find(bitmark => bitmark.status === 'confirmed' && bitmark.head !== 'moved' && !yourTransferOffers.find(offer => offer.bitmark_id === bitmark.id));

                // Send transfer offer
                let receiverAccount = Account.fromSeed(testData.testnet.receiverAccount.seed);
                let transferOfferParams = Bitmark.newTransferOfferParams(receiverAccount.getAccountNumber());
                await transferOfferParams.fromBitmark(bitmark.id);
                transferOfferParams.sign(account);

                let response = await Bitmark.offer(transferOfferParams, account);
                expect(response).to.have.property('offer_id');

                // Response transfer offer
                let offerId = response.offer_id;
                let transferOfferResponseParams = Bitmark.newTransferResponseParams('accept');
                await transferOfferResponseParams.fromOffer(offerId);
                transferOfferResponseParams.sign(receiverAccount);

                response = await Bitmark.response(transferOfferResponseParams, receiverAccount);
                expect(response).to.have.property('tx_id');
            });

            it('should send transfer offer then reject', async function () {
                let account = Account.fromRecoveryPhrase(testData.testnet.phrase);

                let transferOffers = await Bitmark.getTransferOffers(account.getAccountNumber());
                let yourTransferOffers = transferOffers.from;

                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().owner(account.getAccountNumber()).pending(true).build();
                let bitmarks = await Bitmark.list(bitmarkQueryParams);
                let bitmark = bitmarks.find(bitmark => bitmark.status === 'confirmed' && bitmark.head !== 'moved' && !yourTransferOffers.find(offer => offer.bitmark_id === bitmark.id));

                // Send transfer offer
                let receiverAccount = Account.fromSeed(testData.testnet.receiverAccount.seed);
                let transferOfferParams = Bitmark.newTransferOfferParams(receiverAccount.getAccountNumber());
                await transferOfferParams.fromBitmark(bitmark.id);
                transferOfferParams.sign(account);

                let response = await Bitmark.offer(transferOfferParams, account);
                expect(response).to.have.property('offer_id');

                // Response transfer offer
                let offerId = response.offer_id;
                let transferOfferResponseParams = Bitmark.newTransferResponseParams('reject');
                await transferOfferResponseParams.fromOffer(offerId);
                transferOfferResponseParams.sign(receiverAccount);

                response = await Bitmark.response(transferOfferResponseParams, receiverAccount);
                expect(response).to.have.property('status');
                expect(response.status).to.be.equal('OK');
            });

            it('should send transfer offer then cancel', async function () {
                let account = Account.fromRecoveryPhrase(testData.testnet.phrase);

                let transferOffers = await Bitmark.getTransferOffers(account.getAccountNumber());
                let yourTransferOffers = transferOffers.from;

                let bitmarkQueryParams = Bitmark.newBitmarkQueryBuilder().owner(account.getAccountNumber()).pending(true).build();
                let bitmarks = await Bitmark.list(bitmarkQueryParams);
                let bitmark = bitmarks.find(bitmark => bitmark.status === 'confirmed' && bitmark.head !== 'moved' && !yourTransferOffers.find(offer => offer.bitmark_id === bitmark.id));

                // Send transfer offer
                let receiverAccount = Account.fromSeed(testData.testnet.receiverAccount.seed);
                let transferOfferParams = Bitmark.newTransferOfferParams(receiverAccount.getAccountNumber());
                await transferOfferParams.fromBitmark(bitmark.id);
                transferOfferParams.sign(account);

                let response = await Bitmark.offer(transferOfferParams, account);
                expect(response).to.have.property('offer_id');

                // Response transfer offer
                let offerId = response.offer_id;
                let transferOfferResponseParams = Bitmark.newTransferResponseParams('cancel');
                await transferOfferResponseParams.fromOffer(offerId);
                transferOfferResponseParams.sign(account);

                response = await Bitmark.response(transferOfferResponseParams, account);
                expect(response).to.have.property('status');
                expect(response.status).to.be.equal('OK');
            });
        });
    });
});