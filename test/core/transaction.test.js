const chai = require('chai');
const expect = chai.expect;

const sdk = require('../../index');
const Transaction = sdk.Transaction;
const CONSTANTS = require('../constant/constants');
const BITMARK_CONSTANTS = require('../../sdk/constant/constants');

let testData = {
    testnet: {
        seed: '9J87CAsHdFdoEu6N1unZk3sqhVBkVL8Z8',
        phrase: 'name gaze apart lamp lift zone believe steak session laptop crowd hill',
        accountNumber: 'eMCcmw1SKoohNUf3LeioTFKaYNYfp2bzFYpjm3EddwxBSWYVCb',
        publicKey: '369f6ceb1c23dbccc61b75e7990d0b2db8e1ee8da1c44db32280e63ca5804f38',
        network: 'testnet',
        existedAssetId: 'c54294134a632c478e978bcd7088e368828474a0d3716b884dd16c2a397edff357e76f90163061934f2c2acba1a77a5dcf6833beca000992e63e19dfaa5aee2a',
        existedBitmarkId: '889f46d55ddbf6fae2da6fe14ca31b79ab84fe7cd104de735dc8cf9319eb68b5',
        existedBlockNumber: 100
    }
};

describe('Transaction', function () {
    let network = 'testnet';
    before(function () {
        sdk.init({network: network, apiToken: CONSTANTS.TEST_API_TOKEN});
    });

    describe('Query transaction', function () {
        this.timeout(30000);

        describe('Query transactions - List', function () {
            it('should get transactions by owner', async function () {
                let transactionQueryParams = Transaction.newTransactionQueryBuilder().ownedBy(testData[network].accountNumber).build();
                let response = await Transaction.list(transactionQueryParams);
                let txs = response.txs;

                expect(txs).to.be.an('array');
                txs.forEach((tx) => {
                    expect(tx.owner).to.be.equal(testData[network].accountNumber);
                });
            });

            it('should get transactions by asset id', async function () {
                let transactionQueryParams = Transaction.newTransactionQueryBuilder().referencedAsset(testData[network].existedAssetId).build();
                let response = await Transaction.list(transactionQueryParams);
                let txs = response.txs;

                expect(txs).to.be.an('array');
                txs.forEach((tx) => {
                    expect(tx.asset_id).to.be.equal(testData[network].existedAssetId);
                });
            });

            it('should get transactions by bitmark id', async function () {
                let transactionQueryParams = Transaction.newTransactionQueryBuilder().referencedBitmark(testData[network].existedBitmarkId).build();
                let response = await Transaction.list(transactionQueryParams);
                let txs = response.txs;

                expect(txs).to.be.an('array');
                txs.forEach((tx) => {
                    expect(tx.bitmark_id).to.be.equal(testData[network].existedBitmarkId);
                });
            });

            it('should get transactions by block number', async function () {
                let transactionQueryParams = Transaction.newTransactionQueryBuilder().referencedBlockNumber(testData[network].existedBlockNumber).limit(10).build();
                let response = await Transaction.list(transactionQueryParams);
                let txs = response.txs;

                expect(txs).to.be.an('array');
                txs.forEach((tx) => {
                    expect(tx.block_number).to.be.equal(testData[network].existedBlockNumber);
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

            it('should get transactions with at and to (later)', async function () {
                let limit = 1;
                let at = 5;
                let transactionQueryParams = Transaction.newTransactionQueryBuilder().at(at).to(BITMARK_CONSTANTS.QUERY_TO_DIRECTIONS.LATER).limit(limit).build();
                let response = await Transaction.list(transactionQueryParams);
                let txs = response.txs;
                expect(txs).to.be.an('array');
                txs.forEach((bitmark) => {
                    expect(bitmark.offset >= at);
                });
            });

            it('should get transactions with at and to (earlier)', async function () {
                let limit = 1;
                let at = 5;
                let transactionQueryParams = Transaction.newTransactionQueryBuilder().at(at).to(BITMARK_CONSTANTS.QUERY_TO_DIRECTIONS.EARLIER).limit(limit).build();
                let response = await Transaction.list(transactionQueryParams);
                let txs = response.txs;
                expect(txs).to.be.an('array');
                txs.forEach((bitmark) => {
                    expect(bitmark.offset <= at);
                });
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

            it('should get transaction by id with asset', async function () {
                let limit = 1;
                let transactionQueryParams = Transaction.newTransactionQueryBuilder().limit(limit).build();
                let txsResponse = await Transaction.list(transactionQueryParams);
                expect(txsResponse.txs).to.be.an('array');
                expect(txsResponse.txs.length).to.be.equal(limit);

                let txId = txsResponse.txs[0].id;
                let txResponse = await Transaction.getWithAsset(txId);
                expect(txResponse).to.have.property('tx');
                expect(txResponse.tx).to.have.property('id');
                expect(txResponse.tx.id).to.be.equal(txId);

                expect(txResponse).to.have.property('asset');
            });
        });
    });
});