let chai = require('chai');
let expect = chai.expect;
let sdk = require('../index.js');
let Account = sdk.Account;
let fs = require('fs');

let config = require(global.__baseBitmarkSDKModulePath + 'sdk/config.js');
let networks = sdk.networks;
networks.testnet.api_server = 'https://api.devel.bitmark.com';

let validData = [{
  seed: '5XEECt18HGBGNET1PpxLhy5CsCLG9jnmM6Q8QGF4U2yGb1DABXZsVeD',
  phrase: 'accident syrup inquiry you clutch liquid fame upset joke glow best school repeat birth library combine access camera organ trial crazy jeans lizard science',
  network: 'testnet',
  version: 1
}, {
  seed: '5XEECqWqA47qWg86DR5HJ29HhbVqwigHUAhgiBMqFSBycbiwnbY639s',
  phrase: 'ability panel leave spike mixture token voice certain today market grief crater cruise smart camera palm wheat rib swamp labor bid rifle piano glass',
  network: 'livenet',
  version: 1
}];

describe('Account', function() {
  describe('Constructor', function() {
    it('should build with livenet as default', function() {
      expect(function(){
        return new Account();
      }).to.not.throw();

      let account = new Account();
      expect(account.getNetwork()).to.equal('livenet');
    });

    it('should build for testnet if specified', function() {
      let account = new Account('testnet');
      expect(account.getNetwork()).to.equal('testnet');
    });

    it('should throw errors on wrong network or version', function() {
      expect(function() {
        return new Account('fakenet');
      }).to.throw(Error);
    });
  });

  describe('From existing data', function() {
    it('should reproduce right data from string', function() {
      validData.forEach(function(data) {
        let account1 = Account.fromSeed(data.seed);
        let account2 = Account.fromRecoveryPhrase(data.phrase);

        expect(account1.getRecoveryPhrase()).to.equal(data.phrase);
        expect(account2.getSeed()).to.equal(data.seed);
        expect(account1.getNetwork()).to.equal(data.network);
        expect(account2.getNetwork()).to.equal(data.network);
        expect(account1.getAuthKey().toKIF()).to.equal(account2.getAuthKey().toKIF());
        expect(account1.generateKey(1).toString('hex')).to.equal(account2.generateKey(1).toString('hex'));
      });
    });
  });

  describe('Issue API', function() {
    this.timeout(15000);
    it('should allow to issue and use the account to sign', async function(done) {
      let account = Account.fromSeed('5XEECtYtR1zm9RZx1Aw2m3STEDMzm9Ardd7TjN8dAHNCV1dY4HaPHRn');
      let file = './test/tmp/myfile.test';
      fs.writeFileSync(file, sdk.util.common.generateRandomBytes(1000));

      let asset = new sdk.Asset()
        .setName('name')
        .setMetadata({author: 'test'});
      
      await asset.loadFile(file, 'public');
      await account.issue(asset, 10);
      fs.unlinkSync(file);
      done();
    });
  });

  describe('Download Asset', function() {
    it('should get the asset file of its bitmark ', async function(done) {
      let account = Account.fromSeed("5XEECtoyYxvLXC4B4kp5S2nm8xxw37Z4J5iGx17Qu8YaX1g9G23pLoA")
      let data = await account.downloadAsset('8551ad465e0804676c255d80dc03176b975650227efda1f070d3d72e4be2b631'); // text
      expect(data.toString()).to.equal('This is a test assets.\n')
      done();
    })
  })

  describe('Get Bitmarks and transfer API', function() {
    this.timeout(15000);
    it('should allow to get bitmark and transfer it away', function(done) {
      let account = Account.fromSeed('5XEECtYtR1zm9RZx1Aw2m3STEDMzm9Ardd7TjN8dAHNCV1dY4HaPHRn');
      // eKz3xqW6HN9YymvDy6PbTBeKm4RZSWCe35d5mNYqC9xVLbwW7R

      account.getBitmarks({pending: true})
        .then(result => {
          let bitmarks = result.bitmarks;
          let bitmark = bitmarks.find(bitmark => bitmark.status === 'confirmed');
          return account.transfer(bitmark.head_id, 'f2h3q1WAuQHaya3qSduVQwZ7foipo9WBs1DKDNsYvWXKfqrq9k')
        })
        .then(id => {
          expect(id).to.be.ok;
          done();
        })
        .catch(error => {
          expect(error).is.undefined;
          done();
        });
    });
  });
});
