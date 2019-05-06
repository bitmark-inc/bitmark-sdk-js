const sdk = require('bitmark-sdk');
const Bitmark = sdk.Bitmark;

const issueBitmarks = async (account, issuanceInfo) => {
    let issuanceParams = Bitmark.newIssuanceParams(issuanceInfo.assetId, issuanceInfo.quantity);
    issuanceParams.sign(account);

    let bitmarks = (await Bitmark.issue(issuanceParams)).bitmarks;
    return bitmarks;
};

module.exports = {
    issueBitmarks
};