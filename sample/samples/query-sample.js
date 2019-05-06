const sdk = require('bitmark-sdk');
const Bitmark = sdk.Bitmark;
const Asset = sdk.Asset;
const Transaction = sdk.Transaction;

const queryBitmarks = async (bitmarkQueryParams) => {
    let response = await Bitmark.list(bitmarkQueryParams);
    let bitmarks = response.bitmarks;

    return bitmarks;
};

const queryBitmarkById = async (bitmarkId) => {
    let response = await Bitmark.get(bitmarkId);
    return response && response.bitmark;
};

const queryAssets = async (assetQueryParams) => {
    let response = await Asset.list(assetQueryParams);
    let assets = response.assets;

    return assets;
};

const queryAssetById = async (assetId) => {
    let response = await Asset.get(assetId);
    return response && response.asset;
};

const queryTransactions = async (transactionQueryParams) => {
    let response = await Transaction.list(transactionQueryParams);
    let txs = response.txs;
    return txs;
};

const queryTransactionById = async (txId) => {
    let response = await Transaction.get(txId);
    return response && response.tx;
};

module.exports = {
    queryBitmarks,
    queryBitmarkById,
    queryAssets,
    queryAssetById,
    queryTransactions,
    queryTransactionById
};