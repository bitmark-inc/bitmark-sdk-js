let chai = require('chai');;
let expect = chai.expect;
let sdk = require('../../index.js');
let AuthKey = sdk.AuthKey;
let Asset = sdk.Asset;

let config = require(global.__baseBitmarkSDKModulePath + 'sdk/config.js');
let common = require(global.__baseBitmarkSDKModulePath + 'sdk/util/common.js');

/**
 * ****  CREATING ASSET
 * new Asset()
 *   .setName(name)
 *   .setDescription(description)
 *   .setFingerprint(fingerprint)
 *   .sign(authKey);
 *
 * **** Util
 * asset.getRPCMessage()
 * asset.toJSON()
 */

function makeRandomString(length) {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( let i=0; i < length; i++ ) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

let maxName = config.record.asset.max_name;
let maxMetadata = config.record.asset.max_metadata;
let maxDescription = config.record.asset.max_description;
let maxFingerprint = config.record.asset.max_fingerprint;
let pk = new AuthKey('testnet');
let metadataSeparator = String.fromCharCode(parseInt('\u0000',16));

describe('Asset', function(){
  it('should throw error on too long name', function(){
    expect(function(){
      return new Asset().setName(makeRandomString(maxName+1));
    }).to.throw(Error);
  });
  it('should be able to check for valid metadata', function() {
    let key = makeRandomString(10);
    let invalidValue = makeRandomString(maxMetadata - 10);
    let invalidData = {};
    invalidData[key] = invalidValue;
    expect(Asset.isValidMetadata(invalidData)).to.equal(false);

    let validValue = makeRandomString(maxMetadata - 11);
    let validData = {};
    validData[key] = validValue;
    expect(Asset.isValidMetadata(validData)).to.equal(true);
  });
  it('should allow to setMetadata if the data is valid', function() {
    let asset1 = new Asset().setName(makeRandomString(maxName));
    let invalidMetadata = {};
    invalidMetadata[makeRandomString(10)] = makeRandomString(10);
    invalidMetadata[makeRandomString(10)] = makeRandomString(maxMetadata - 33 + 1);
    expect(function() { return asset1.setMetadata(invalidMetadata); }).to.throw(Error);

    let asset2 = new Asset().setName(makeRandomString(maxName));
    let validMetadata = {};
    validMetadata[makeRandomString(10)] = makeRandomString(10);
    validMetadata[makeRandomString(10)] = makeRandomString(maxMetadata - 33);
    expect(function() { return asset2.setMetadata(validMetadata); }).to.not.throw(Error);
    expect(asset2.getMetadata()).to.deep.equal(validMetadata);

    let asset3 = new Asset().setName(makeRandomString(maxName));
    expect(function() { return asset3.setMetadata("key", "value"); }).to.throw(Error);
  });
  it('should allow to import the metadata string if it is valid', function() {
    let tooLongMetadataString = makeRandomString(10) +
                                  metadataSeparator +
                                  makeRandomString(maxMetadata-10);
    let unparsableMetadataString = makeRandomString(10) +
                                    metadataSeparator +
                                    makeRandomString(10) +
                                    metadataSeparator +
                                    makeRandomString(10);
    expect(function() { return new Asset().importMetadata(tooLongMetadataString); }).to.throw(Error);
    expect(function() { return new Asset().importMetadata(unparsableMetadataString); }).to.throw(Error);

    let validMetadataString = makeRandomString(10) +
                              metadataSeparator +
                              makeRandomString(10) +
                              metadataSeparator +
                              makeRandomString(10) +
                              metadataSeparator +
                              makeRandomString(10);
    expect(function() { return new Asset().importMetadata(validMetadataString); }).to.not.throw(Error);
  });
  it('should allow to add and remove metadata key value pair', function() {
    let asset = new Asset().setMetadata({
      key1: 'value1'
    });
    asset.addMetadata('key2', 'value2');
    expect(asset.getMetadata()).to.deep.equal({
      key1: 'value1',
      key2: 'value2'
    });

    asset.removeMetadata('key1');
    expect(asset.getMetadata()).to.deep.equal({ key2: 'value2' });

    expect(function() {
      return asset.addMetadata('key3', makeRandomString(maxMetadata));
    }).to.throw(Error);
  });
  it('should throw error on too long fingerprint', function(){
    expect(function(){
      return new Asset().setDescription(makeRandomString(maxFingerprint+1));
    }).to.throw(Error);
  });
  it('should not sign when name is missing', function(){
    expect(function(){
      return new Asset()
              .setDescription(makeRandomString(maxDescription))
              .setFingerprint(makeRandomString(maxFingerprint))
              .sign(pk);
    }).to.throw(Error);
  });
  it('should not sign when fingerprint is missing', function(){
    expect(function(){
      return new Asset()
              .setName(makeRandomString(maxName))
              .setDescription(makeRandomString(maxDescription))
              .sign(pk);
    }).to.throw(Error);
  });
  it('should still sign when description is missing', function(){
    expect(function(){
      return new Asset()
              .setName(makeRandomString(maxName))
              .setFingerprint(makeRandomString(maxFingerprint))
              .sign(pk);
    }).to.not.throw(Error);
  });

  let data = {
    pk: AuthKey.fromKIF('Zjbm1pyA1zjpy5RTeHtBqSAr2NvErTxsovkbWs1duVy8yYG9Xr'),
    name: 'this is name',
    metadata: 'description' + metadataSeparator +'this is description',
    fingerprint: '5b071fe12fd7e624cac31b3d774715c11a422a3ceb160b4f1806057a3413a13c',
    signature: '2028900a6ddebce59e29fb41c27b45be57a07177927b24e46662e007ecad066399e87f4dec4eecb45599e9e9186497374978595a36f908b4fed9a51145b6e803'
  };
  let createValidAsset = function() {
    return new Asset()
      .setName(data.name)
      .importMetadata(data.metadata)
      .setFingerprint(data.fingerprint)
      .sign(data.pk);
  }
  it('should be able to generate the right signature for the record', function(){
    let asset = createValidAsset();
    expect(asset.getSignature().toString('hex')).to.equal(data.signature);
  });
  it('getters should return correct result', function(){
    let asset = new Asset();
    expect(asset.isSigned()).to.not.be.ok;
    asset = createValidAsset();
    expect(asset.isSigned()).to.be.ok;
    expect(asset.getName()).to.equal(data.name);
    expect(asset.getMetadata()).to.deep.equal({description: 'this is description'});
    expect(asset.getFingerprint()).to.equal(data.fingerprint);
    expect(asset.getRegistrant().toString()).to.equal(data.pk.getAccountNumber().toString());
    expect(asset.getSignature().toString('hex')).to.equal(data.signature);
    expect(asset.toJSON()).to.deep.equal({
      name: 'this is name',
      metadata: 'description' + metadataSeparator +'this is description',
      fingerprint: '5b071fe12fd7e624cac31b3d774715c11a422a3ceb160b4f1806057a3413a13c',
      registrant: data.pk.getAccountNumber().toString(),
      signature: '2028900a6ddebce59e29fb41c27b45be57a07177927b24e46662e007ecad066399e87f4dec4eecb45599e9e9186497374978595a36f908b4fed9a51145b6e803'
    });
  });
  it('should return Asset instance when initiating without `new` keyword', function(){
    let asset = Asset();
    expect(asset).to.be.instanceof(Asset);
  });

});