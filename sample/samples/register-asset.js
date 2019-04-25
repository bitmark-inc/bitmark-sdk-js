const sdk = require('bitmark-sdk');
const Asset = sdk.Asset;

const registerAsset = async (account, registrationInfo) => {
    let registrationParams = Asset.newRegistrationParams(registrationInfo.assetName, registrationInfo.metadata);
    await registrationParams.setFingerprint(registrationInfo.assetFilePath);
    registrationParams.sign(account);

    let assets = (await Asset.register(registrationParams)).assets;
    return assets;
};

module.exports = {
    registerAsset
};