const chai = require('chai');
const expect = chai.expect;

const sdk = require('../../index');
const Transaction = sdk.Transaction;
const CONSTANTS = require('../constant/constants');

let testData = {
    testnet: {
        seed: '5XEECt18HGBGNET1PpxLhy5CsCLG9jnmM6Q8QGF4U2yGb1DABXZsVeD',
        phrase: 'accident syrup inquiry you clutch liquid fame upset joke glow best school repeat birth library combine access camera organ trial crazy jeans lizard science',
        accountNumber: 'ec6yMcJATX6gjNwvqp8rbc4jNEasoUgbfBBGGyV5NvoJ54NXva',
        publicKey: '58760a01edf5ed4f95bfe977d77a27627cd57a25df5dea885972212c2b1c0e2f',
        network: 'testnet',
        version: 1,
        existedAssetId: '0e0b4e3bd771811d35a23707ba6197aa1dd5937439a221eaf8e7909309e7b31b6c0e06a1001c261a099abf04c560199db898bc154cf128aa9efa5efd36030c64',
        existedBitmarkId: 'c8e021c1a093c32909e4d29b4624f8a5443e349a597314b7c9527ce310749121'
    }
};

describe('Transaction', function () {
    before(function () {
        sdk.init({network: 'testnet', apiToken: CONSTANTS.TEST_API_TOKEN});
    });

    describe('Query transaction', function () {
        this.timeout(15000);

        describe('Query transactions - List', function () {
            it('should get transactions by owner', async function () {
                let transactionQueryParams = Transaction.newTransactionQueryBuilder().ownedBy(testData.testnet.accountNumber).build();
                let response = await Transaction.list(transactionQueryParams);
                let txs = response.txs;

                expect(txs).to.be.an('array');
                txs.forEach((tx) => {
                    expect(tx.owner).to.be.equal(testData.testnet.accountNumber);
                });
            });

            it('should get transactions by asset id', async function () {
                let transactionQueryParams = Transaction.newTransactionQueryBuilder().referencedAsset(testData.testnet.existedAssetId).build();
                let response = await Transaction.list(transactionQueryParams);
                let txs = response.txs;

                expect(txs).to.be.an('array');
                txs.forEach((tx) => {
                    expect(tx.asset_id).to.be.equal(testData.testnet.existedAssetId);
                });
            });

            it('should get transactions by bitmark id', async function () {
                let transactionQueryParams = Transaction.newTransactionQueryBuilder().referencedBitmark(testData.testnet.existedBitmarkId).build();
                let response = await Transaction.list(transactionQueryParams);
                let txs = response.txs;

                expect(txs).to.be.an('array');
                txs.forEach((tx) => {
                    expect(tx.bitmark_id).to.be.equal(testData.testnet.existedBitmarkId);
                });
            });

            it('should get transactions with assets', async function () {
                let transactionQueryParams = Transaction.newTransactionQueryBuilder().loadAsset(true).build();
                let response = await Transaction.list(transactionQueryParams);
                expect(response.txs).to.be.an('array');
                expect(response.assets).to.be.an('array');
            });

            it('should get transactions with limit', async function () {
                let limit = 1;
                let transactionQueryParams = Transaction.newTransactionQueryBuilder().limit(limit).build();
                let response = await Transaction.list(transactionQueryParams);
                expect(response.txs).to.be.an('array');
                expect(response.txs.length).to.be.equal(limit);
            });
        });

        describe('Query transaction - Get', function () {
            it('should get transaction by id', async function () {
                let limit = 1;
                let transactionQueryParams = Transaction.newTransactionQueryBuilder().limit(limit).build();
                let txsResponse = await Transaction.list(transactionQueryParams);
                expect(txsResponse.txs).to.be.an('array');
                expect(txsResponse.txs.length).to.be.equal(limit);

                let txId = txsResponse.txs[0].id;
                let txResponse = await Transaction.get(txId);
                expect(txResponse).to.have.property('tx');
                expect(txResponse.tx).to.have.property('id');
                expect(txResponse.tx.id).to.be.equal(txId);
            });
        });
    });
});