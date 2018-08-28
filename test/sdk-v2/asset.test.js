const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');

const sdk = require('../../index');
const common = require('../../sdk-v2/util/common');
const apiService = require('../../sdk-v2/service/api-service');
const Account = sdk.Account;
const Asset = sdk.Asset;
const Bitmark = sdk.Bitmark;

let testData = {
    testnet: {
        seed: '5XEECt18HGBGNET1PpxLhy5CsCLG9jnmM6Q8QGF4U2yGb1DABXZsVeD',
        phrase: 'accident syrup inquiry you clutch liquid fame upset joke glow best school repeat birth library combine access camera organ trial crazy jeans lizard science',
        accountNumber: 'ec6yMcJATX6gjNwvqp8rbc4jNEasoUgbfBBGGyV5NvoJ54NXva',
        publicKey: '58760a01edf5ed4f95bfe977d77a27627cd57a25df5dea885972212c2b1c0e2f',
        network: 'testnet',
        version: 1
    },
    livenet: {
        seed: '5XEECqWqA47qWg86DR5HJ29HhbVqwigHUAhgiBMqFSBycbiwnbY639s',
        phrase: 'ability panel leave spike mixture token voice certain today market grief crater cruise smart camera palm wheat rib swamp labor bid rifle piano glass',
        accountNumber: 'bDnC8nCaupb1AQtNjBoLVrGmobdALpBewkyYRG7kk2euMG93Bf',
        publicKey: '9aaf14f906e2be86b32eae1b206335e73646e51f8bf29b6bc580b1d5a0be67b1',
        network: 'livenet',
        version: 1
    }
};

describe('Asset', function () {
    describe('Register Asset', function () {
        before(function () {
            sdk.init({network: 'testnet'});
        });

        this.timeout(15000);

        it('should register asset successfully', async function () {
            let account = Account.fromSeed(testData.testnet.seed);
            let testFile = './test/sdk-v2/tmp/myfile.test';
            fs.writeFileSync(testFile, common.generateRandomBytesByLength(1000));

            let registrationParams = Asset.newRegistrationParams('name', {author: 'test'});
            await registrationParams.setFingerprint(testFile);
            registrationParams.sign(account);

            // TODO: Will remove if API support user register asset without issue at least 1 bitmark
            let assetId = common.computeAssetId(registrationParams.fingerprint);
            let issuanceParams = Bitmark.newIssuanceParams(assetId, 1);
            issuanceParams.sign(account);

            // TODO: Will remove if Bitmark Blockchain doesn't support store asset file anymore
            await upload(fs.createReadStream(testFile), 'public', assetId, account);

            await Asset.register(registrationParams, issuanceParams);

            fs.unlinkSync(testFile);
        });

        it('should not register asset without registration params', function (done) {
            expect(function () {
                Asset.register().then(() => {
                    done();
                }).catch((err) => {
                    done();
                });
            }).to.not.throw();
        });

        it('should not register asset with wrong registration params', function (done) {
            expect(function () {
                Asset.register({}).then(() => {
                    done();
                }).catch((err) => {
                    done();
                });
            }).to.not.throw();
        });
    });
});


function upload(fileReaderStream, accessibility, assetId, account) {
    let requester = account.getAccountNumber();
    let timestamp = new Date().getTime();
    let messageToSign = `uploadAsset|${assetId}|${requester}|${timestamp}`;
    let signature = account.sign(messageToSign).toString('hex');
    let headers = {
        requester,
        timestamp,
        signature
    };

    return apiService.sendMultipartRequest({
        url: 'assets',
        params: {file: fileReaderStream, accessibility, asset_id: assetId},
        headers
    });
}
