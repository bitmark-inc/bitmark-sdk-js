'use strict';
const _ = require('lodash');

const util = require('../../util');
const assert = require('../../util/assert');
const common = require('../../util/common');
const varint = require('../../util/varint');
const binary = require('../../util/binary');
const BITMARK_CONFIG = require('../../config/bitmark-config');


// CONSTRUCTOR
let RegistrationParams = function (assetName, metadata) {
    assert.parameter(_.isString(assetName), `Asset Name must be a string`);
    assert.parameter(isValidAssetNameLength(assetName), `Asset Name is too long`);
    assert.parameter(_.isObject(metadata), `Metadata must be an object`);
    assert.parameter(isValidMetadataLength(metadata), `Metadata is too long`);

    this.assetName = assetName;
    this.metadata = metadata;
};


// PROTOTYPE METHODS
RegistrationParams.prototype.setFingerprint = async function (filePath) {
    this.fingerprint = await util.fingerprint.fromFile(filePath);
};

RegistrationParams.prototype.sign = function (account) {
    let packagedParamsBuffer;
    packagedParamsBuffer = varint.encode(BITMARK_CONFIG.record.asset.value);
    packagedParamsBuffer = binary.appendString(packagedParamsBuffer, this.assetName);
    packagedParamsBuffer = binary.appendString(packagedParamsBuffer, this.fingerprint);
    packagedParamsBuffer = binary.appendString(packagedParamsBuffer, common.mapToMetadataString(this.metadata));
    packagedParamsBuffer = binary.appendBuffer(packagedParamsBuffer, account.packagePublicKey());

    this.signature = account.sign(packagedParamsBuffer);
    this.registrant = account.getAccountNumber();
};

RegistrationParams.prototype.toJSON = function () {
    assert(this.signature, 'Need to sign the record before getting JSON format');
    let result = {
        fingerprint: this.fingerprint,
        name: this.assetName,
        metadata: common.mapToMetadataString(this.metadata),
        registrant: this.registrant,
        signature: this.signature.toString('hex')
    };

    return result;
};


// INTERNAL METHODS
function isValidAssetNameLength(assetName) {
    return assetName.length <= BITMARK_CONFIG.record.asset.max_name;
}

function isValidMetadataLength(metadata) {
    let metadataString = common.mapToMetadataString(metadata);
    return metadataString.length <= BITMARK_CONFIG.record.asset.max_metadata;
}


module.exports = RegistrationParams;
