const sdk = require('bitmark-sdk');
const Bitmark = sdk.Bitmark;
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
    queryTransactions,
    queryTransactionById
};