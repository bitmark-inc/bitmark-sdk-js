const chai = require('chai');
const expect = chai.expect;

const sdk = require('../../index');
const Account = sdk.Account;

let validData = {
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

    describe('From existing data', function () {
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

    describe('Parse account number', function () {
        it('should parse valid account number', function () {
            let accountInfo = Account.parseAccountNumber(validData.testnet.accountNumber);

            expect(accountInfo.network).to.equal('testnet');
            expect(accountInfo.pubKey.toString('hex')).to.equal(validData.testnet.publicKey);
        });

        it('should not parse invalid account number', function () {
            expect(function () {
                let accountInfo = Account.parseAccountNumber('wrongAccountNumber');
            }).to.throw();
        });

        it('should not pass not string account number', function () {
            expect(function () {
                let accountInfo = Account.parseAccountNumber(123);
            }).to.throw();
        });
    });

    describe('Validate account number', function () {
        before(function () {
            sdk.init({network: 'testnet'});
        });

        it('should validate valid account number', function () {
            let result = Account.isValidAccountNumber(validData.testnet.accountNumber);

            expect(result).to.equal(true);
        });

        it('should not validate invalid account number', function () {
            let result = Account.isValidAccountNumber('wrongAccountNumber');

            expect(result).to.equal(false);
        });

        it('should not validate not string account number', function () {
            let result = Account.isValidAccountNumber(123);
            expect(result).to.equal(false);
        });
    });
});
