'use strict';

module.exports = {
  key: {
    type: {
      ed25519: {
        name: 'ed25519',
        value: 0x01,
        pubkey_length: 32,
        prikey_length: 64,
        seed_length: 32
      }
    },
    part: {
      private_key: 0x00,
      public_key: 0x01
    },
    checksum_length: 4,
    auth_key_index: 999
  },
  record: {
    asset: {
      value: 0x02,
      max_name: 64,
      max_metadata: 2048,
      max_fingerprint: 1024
    },
    issue: {value: 0x03 },
    transfer: {value: 0x04}
  },
  seed: {
    version: 0x01,
    length: 32,
    checksum_length: 4,
    network_length: 1,
    magic: new Buffer('5afe', 'hex')
  },
  core: {
    length: 32,
    counter_length: 16,
    nonce_length: 24
  },
  currency: {
    'bitcoin': 0x01
  }
};
