let chai = require('chai');
let expect = chai.expect;
let sdk = require('../index.js');
let Account = sdk.Account;

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

  describe('Account API', function() {
    this.timeout(15000);
    it('should allow to issue and use the account to sign', function(done) {
      let account = new Account('testnet');
      let fileContent = Buffer.from('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'hex');
      account.issue(fileContent, 'public', 'name', {author: 'test'}, 10)
        .then(result => {
          expect(result).to.be.ok;
          done();
        })
        .catch(error => {
          expect(error).to.be.undefined;
        });
    });
  });
});
