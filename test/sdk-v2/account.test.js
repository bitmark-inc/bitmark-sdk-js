const chai = require('chai');
const expect = chai.expect;
const sdk = require('../../index');
const Account = sdk.Account;

let validData = {
    testnet: {
        seed: '5XEECt18HGBGNET1PpxLhy5CsCLG9jnmM6Q8QGF4U2yGb1DABXZsVeD',
        phrase: 'accident syrup inquiry you clutch liquid fame upset joke glow best school repeat birth library combine access camera organ trial crazy jeans lizard science',
        accountNumber: 'ec6yMcJATX6gjNwvqp8rbc4jNEasoUgbfBBGGyV5NvoJ54NXva',
        network: 'testnet',
        version: 1
    }, livenet: {
        seed: '5XEECqWqA47qWg86DR5HJ29HhbVqwigHUAhgiBMqFSBycbiwnbY639s',
        phrase: 'ability panel leave spike mixture token voice certain today market grief crater cruise smart camera palm wheat rib swamp labor bid rifle piano glass',
        accountNumber: 'bDnC8nCaupb1AQtNjBoLVrGmobdALpBewkyYRG7kk2euMG93Bf',
        network: 'livenet',
        version: 1
    }
};

describe('Account', function () {
    describe('Constructor', function () {
        before(function () {
            sdk.init({network: 'testnet'});
        });

        it('should construct without Error', function () {
            expect(function () {
                return new Account();
            }).to.not.throw();

            let account = new Account();
            expect(account.getNetwork()).to.equal('testnet');
        });
    });

    describe('From existing data - testnet', function () {
        before(function () {
            sdk.init({network: 'testnet'});
        });

        let data = validData.testnet;
        it('should recovery right account from seed string', function () {
            let account = Account.fromSeed(data.seed);

            expect(account.getSeed()).to.equal(data.seed);
            expect(account.getNetwork()).to.equal(data.network);
            expect(account.getAccountNumber()).to.equal(data.accountNumber);
        });

        it('should recovery right account from recovery phrase string', function () {
            let account = Account.fromRecoveryPhrase(data.phrase);

            expect(account.getRecoveryPhrase()).to.equal(data.phrase);
            expect(account.getNetwork()).to.equal(data.network);
            expect(account.getAccountNumber()).to.equal(data.accountNumber);
        });
    });

    describe('From existing data - livenet', function () {
        before(function () {
            sdk.init({network: 'livenet'});
        });

        let data = validData.livenet;
        it('should recovery right account from seed string', function () {
            let account = Account.fromSeed(data.seed);

            expect(account.getSeed()).to.equal(data.seed);
            expect(account.getNetwork()).to.equal(data.network);
            expect(account.getAccountNumber()).to.equal(data.accountNumber);
        });

        it('should recovery right account from recovery phrase string', function () {
            let account = Account.fromRecoveryPhrase(data.phrase);

            expect(account.getRecoveryPhrase()).to.equal(data.phrase);
            expect(account.getNetwork()).to.equal(data.network);
            expect(account.getAccountNumber()).to.equal(data.accountNumber);
        });
    });
});
