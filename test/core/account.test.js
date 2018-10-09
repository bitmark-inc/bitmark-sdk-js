const chai = require('chai');
const expect = chai.expect;

const sdk = require('../../index');
const Account = sdk.Account;
const CONSTANTS = require('../constant/constants');

let validData = {
    testnet: {
        seed: '9J87CAsHdFdoEu6N1unZk3sqhVBkVL8Z8',
        phrase: 'name gaze apart lamp lift zone believe steak session laptop crowd hill',
        phrase_cn: '箱 阻 起 归 彻 矮 问 栽 瓜 鼓 支 乐',
        accountNumber: 'eMCcmw1SKoohNUf3LeioTFKaYNYfp2bzFYpjm3EddwxBSWYVCb',
        publicKey: '369f6ceb1c23dbccc61b75e7990d0b2db8e1ee8da1c44db32280e63ca5804f38',
        network: 'testnet'
    },
    livenet: {
        seed: '9J87GaPq7FR9Uacdi3FUoWpP6LbEpo1Ax',
        phrase: 'surprise mesh walk inject height join sound minor margin over jewel venue',
        phrase_cn: '薯 托 剑 景 担 额 牢 痛 亦 软 凯 谊',
        accountNumber: 'aiKFA9dKkNHPys3nSZrLTPusoocPqXSFp5EexsgQ1hbYUrJVne',
        publicKey: '57c7e89cc648a387d9e5727237604a3b9007c2ceffbf99760a16b9d3cffcdf7e',
        network: 'livenet'
    }
};

describe('Account', function () {
    describe('Create new account', function () {
        it('should create new account - testnet', function () {
            sdk.init({network: 'testnet', apiToken: CONSTANTS.TEST_API_TOKEN});
            expect(function () {
                return new Account();
            }).to.not.throw();

            let account = new Account();
            expect(account.getNetwork()).to.equal('testnet');
        });

        it('should create new account - livenet', function () {
            sdk.init({network: 'livenet', apiToken: CONSTANTS.TEST_API_TOKEN});
            expect(function () {
                return new Account();
            }).to.not.throw();

            let account = new Account();
            expect(account.getNetwork()).to.equal('livenet');
        });
    });

    describe('From existing data', function () {
        describe('From existing data - testnet', function () {
            before(function () {
                sdk.init({network: 'testnet', apiToken: CONSTANTS.TEST_API_TOKEN});
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

            it('should recovery right account from recovery phrase chinese string', function () {
                let account = Account.fromRecoveryPhrase(data.phrase_cn, 'cn');

                expect(account.getRecoveryPhrase()).to.equal(data.phrase);
                expect(account.getNetwork()).to.equal(data.network);
                expect(account.getAccountNumber()).to.equal(data.accountNumber);
            });
        });

        describe('From existing data - livenet', function () {
            before(function () {
                sdk.init({network: 'livenet', apiToken: CONSTANTS.TEST_API_TOKEN});
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

            it('should recovery right account from recovery phrase chinese string', function () {
                let account = Account.fromRecoveryPhrase(data.phrase_cn, 'cn');

                expect(account.getRecoveryPhrase()).to.equal(data.phrase);
                expect(account.getNetwork()).to.equal(data.network);
                expect(account.getAccountNumber()).to.equal(data.accountNumber);
            });
        });
    });

    describe('Validate multiple languages phrase - testnet', function () {
        before(function () {
            sdk.init({network: 'testnet', apiToken: CONSTANTS.TEST_API_TOKEN});
        });

        let data = validData.testnet;
        it('should validate valid chinese phrase', function () {
            let account = Account.fromSeed(data.seed);

            expect(account.getRecoveryPhrase('cn')).to.equal(data.phrase_cn);
        });
    });

    describe('Validate multiple languages phrase - livenet', function () {
        before(function () {
            sdk.init({network: 'livenet', apiToken: CONSTANTS.TEST_API_TOKEN});
        });

        let data = validData.livenet;
        it('should validate valid chinese phrase', function () {
            let account = Account.fromSeed(data.seed);

            expect(account.getRecoveryPhrase('cn')).to.equal(data.phrase_cn);
        });
    });

    describe('Parse account number', function () {
        before(function () {
            sdk.init({network: 'testnet', apiToken: CONSTANTS.TEST_API_TOKEN});
        });

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
            sdk.init({network: 'testnet', apiToken: CONSTANTS.TEST_API_TOKEN});
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
