const sdk = require('bitmark-sdk');
const Account = sdk.Account;

const createNewAccount = () => {
    let account = new Account();
    return account;
};

const getRecoveryPhraseFromAccount = (account) => {
    return account.getRecoveryPhrase();
};

const getAccountFromRecoveryPhrase = (recoveryPhrase) => {
    return Account.fromRecoveryPhrase(recoveryPhrase);
};

module.exports = {
    createNewAccount,
    getAccountFromRecoveryPhrase,
    getRecoveryPhraseFromAccount
};