module.exports = {
  livenet: {
    name: 'livenet',
    account_number_value: 0x00,
    kif_value: 0x00,
    seed_value: 0x00,
    api_server: 'https://api.bitmark.com',
    api_version: 'v1'
  },
  testnet: {
    name: 'testnet',
    account_number_value: 0x01,
    kif_value: 0x01,
    seed_value: 0x01,
    api_server: 'https://api.test.bitmark.com',
    api_version: 'v1'
  }
};
