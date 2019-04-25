const sdk = require('bitmark-sdk');
const Bitmark = sdk.Bitmark;

const transferOneSignature = async (account, transferInfo) => {
    let transferParams = Bitmark.newTransferParams(transferInfo.receiverAccountNumber);
    await transferParams.fromBitmark(transferInfo.bitmarkId);
    transferParams.sign(account);

    let response = await Bitmark.transfer(transferParams);
    return response;
};

const sendTransferOffer = async (account, transferOfferInfo) => {
    let transferOfferParams = Bitmark.newTransferOfferParams(transferOfferInfo.receiverAccountNumber);
    await transferOfferParams.fromBitmark(transferOfferInfo.bitmarkId);
    transferOfferParams.sign(account);

    let response = await Bitmark.offer(transferOfferParams);
    return response;
};

const respondToTransferOffer = async (account, responseInfo) => {
    let transferOfferResponseParams = Bitmark.newTransferResponseParams(responseInfo.confirmation);
    await transferOfferResponseParams.fromBitmark(responseInfo.bitmarkId);
    transferOfferResponseParams.sign(account);

    let response = await Bitmark.response(transferOfferResponseParams, account);
    return response;
};

module.exports = {
    transferOneSignature,
    sendTransferOffer,
    respondToTransferOffer
};