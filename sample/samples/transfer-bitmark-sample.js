const sdk = require('bitmark-sdk');
const Bitmark = sdk.Bitmark;

const transferOneSignature = async (sender, transferInfo) => {
    let transferParams = Bitmark.newTransferParams(transferInfo.receiverAccountNumber);
    await transferParams.fromBitmark(transferInfo.bitmarkId);
    transferParams.sign(sender);

    let response = await Bitmark.transfer(transferParams);
    return response;
};

const sendTransferOffer = async (sender, transferOfferInfo) => {
    let transferOfferParams = Bitmark.newTransferOfferParams(transferOfferInfo.receiverAccountNumber);
    await transferOfferParams.fromBitmark(transferOfferInfo.bitmarkId);
    transferOfferParams.sign(sender);

    let response = await Bitmark.offer(transferOfferParams);
    return response;
};

const respondToTransferOffer = async (receiver, responseInfo) => {
    let transferOfferResponseParams = Bitmark.newTransferResponseParams(responseInfo.confirmation);
    await transferOfferResponseParams.fromBitmark(responseInfo.bitmarkId);
    transferOfferResponseParams.sign(receiver);

    let response = await Bitmark.respond(transferOfferResponseParams, receiver);
    return response;
};

const cancelTransferOffer = async (sender, bitmarkId) => {
    let transferOfferResponseParams = Bitmark.newTransferResponseParams('cancel');
    await transferOfferResponseParams.fromBitmark(bitmarkId);

    let response = await Bitmark.respond(transferOfferResponseParams, sender);
    return response;
};

module.exports = {
    transferOneSignature,
    sendTransferOffer,
    respondToTransferOffer,
    cancelTransferOffer
};