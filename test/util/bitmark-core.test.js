const chai = require('chai');
const expect = chai.expect;

const bitmarkCore = require('../../sdk/util/bitmark-core');
const common = require('../../sdk/util/common');
const networkUtil = require('../../sdk/util/network');

const testData = [
    {
        phrase: "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon",
        base58: "9J8739KB7PSFpEoPsbo2DcdQMCDLvFyB8",
        hex: "000000000000000000000000000000000",
        network: "LIVENET",
        key10: "68a63043622ac1e25a0c3d088d1928cc6a5adc36c333afc9c667e059fede4bd2",
    },
    {
        phrase: "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon ability",
        base58: "9J8739KB7PSFpEoPsbo2DcdQMCF9Ru2zJ",
        hex: "000000000000000000000000000000001",
        network: "LIVENET",
        key10: "c0123818c68f18a2d1a2cd8ede05dfd2f6e4e7f12e44c14a8baeaf5fd18275a6",
    },
    {
        phrase: "abandon zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo",
        base58: "9J8739m2q1MEFN6HkyE25JYhb1VQvfoXY",
        hex: "001ffffffffffffffffffffffffffffff",
        network: "ERROR",
        key10: "ERROR",
    },
    {
        phrase: "ability abandon zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo",
        base58: "9J8739m3ZUkcsjse1EtyKyAfXb8WBsAow",
        hex: "002003fffffffffffffffffffffffffff",
        network: "ERROR",
        key10: "ERROR",
    },
    {
        phrase: "ability ability ability ability ability ability ability ability ability ability ability ability",
        base58: "9J8739m3ZVxRBfXB8FDVZNuGYkSd3SBv3",
        hex: "002004008010020040080100200400801",
        network: "ERROR",
        key10: "ERROR",
    },
    {
        phrase: "ability ability zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo",
        base58: "9J8739m4HxA1W7ezFWZvadndUAmYWXVGU",
        hex: "002007fffffffffffffffffffffffffff",
        network: "ERROR",
        key10: "ERROR",
    },
    {
        phrase: "ability zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo",
        base58: "9J873ACtYdGCgVPBeLf1vzTzppoHp32cz",
        hex: "003ffffffffffffffffffffffffffffff",
        network: "ERROR",
        key10: "ERROR",
    },
    {
        phrase: "zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo",
        base58: "9J87JtLihVvw1hMVkLTxjAa6Bf1TA47di",
        hex: "fffffffffffffffffffffffffffffffff",
        network: "LIVENET",
        key10: "3812c3dda9255ac646c363b5e6fd15687e3194b31d464c862c3e9d9a9c89efd4",
    },
    {
        phrase: "horse steel volume reduce escape churn author hurt timber sleep enjoy dignity",
        base58: "9J879u7LPPYUXfu7FDDiLTWK6av5K6FEQ",
        hex: "6ddaa7d75a04d05183db7ee239652a9f0",
        network: "ERROR",
        key10: "ERROR",
    },
    {
        phrase: "dad budget race exhaust shine ordinary tower frame battle panther fall mail",
        base58: "9J876X5USz8d4JjWqEZQgLg14GLfB4wD6",
        hex: "36e3b2c1a7bc5f38b98ae41353f948c31",
        network: "ERROR",
        key10: "ERROR",
    },
    {
        phrase: "during kingdom crew atom practice brisk weird document eager artwork ride then",
        base58: "9J877LVjhr3Xxd2nGzRVRVNUZpSKJF4TH",
        hex: "442f54cd072a9638be4a0344e1a6e5f01",
        network: "TESTNET",
        key10: "be4a4a0730e19371edef04d38f9ca8187c376633f906ad602b7716e6d19b8374",
    },
    {
        phrase: "device link subject enemy quick alpha useless cotton bundle best twice limb",
        base58: "9J876sm4KtT591aXEYmmnWT1P1u5NDP6q",
        hex: "3cb0435fa4fafa0e3c01861e42abad40e",
        network: "ERROR",
        key10: "ERROR",
    },
    {
        phrase: "depend crime cricket castle fun purse announce nephew profit cloth trim deliver",
        base58: "9J876mP7wDJ6g5P41eNMN8N3jo9fycDs2",
        hex: "3ae670cd91c5e15d0254a2abc57ba29d0",
        network: "TESTNET",
        key10: "ecb58de83f46a0a9cc3f800fbdfa2542e76f1abbd13ee55af91753b86f0b4180",
    },
    {
        phrase: "ring immune garage cargo key squeeze please wasp erosion play erupt key",
        base58: "9J87EatAn3yLJxqPcFFQRnbnhGfYdQ6u1",
        hex: "ba0e357d9157a1a7299fbc4cb4c933bd0",
        network: "LIVENET",
        key10: "186b1f0237416cea8824a9321f5e183c011b85459ed85f53577a1e0af78f0cf8",
    },
    {
        phrase: "horse steel volume reduce escape churn author hurt timber sleep enjoy dignity",
        base58: "9J879u7LPPYUXfu7FDDiLTWK6av5K6FEQ",
        hex: "6ddaa7d75a04d05183db7ee239652a9f0",
        network: "ERROR",
        key10: "ERROR",
    },
    {
        phrase: "file earn crack fever crack differ wreck crazy salon imitate swamp sample",
        base58: "9J878SbnM2GFqAELkkiZbqHJDkAj57fYK",
        hex: "5628a8c72ab31c7bbf8996be8e2f6cdf8",
        network: "TESTNET",
        key10: "8267d00a94ade62c34ebc8aecc393ed6c7fdbb02b7cd58d9264286922b4db221",
    },
    {
        phrase: "absorb lesson capital old logic person glue lend rocket barrel intact miracle",
        base58: "9J873CDHZyye3bsF4yrft4usm42zJrs8X",
        hex: "00d00c884d08394698fbffbb6259d646b",
        network: "LIVENET",
        key10: "4a990e462f7aef7d2296dab6b6a6baa79e4ee073c5d6d4b8c142c4f5d40b642c",
    },
    {
        phrase: "hundred diary business foot issue forward penalty broccoli clerk category ship help",
        base58: "9J879ykQwWijwsrQbGop819AiLqk1Jf1Z",
        hex: "6f27a87c2d776ab7a8a0e32a648718358",
        network: "LIVENET",
        key10: "cd98d3d1b38bb26e57fd9e217d374f1c38115d71e1ab92461ba0681980994ae8",
    }
];

describe('Bitmark Core', function () {
    it('Core To Phrase', function () {
        testData.forEach(item => {
            let core = Buffer.from(item.hex + '0', 'hex');
            let phrase = bitmarkCore.exportTo12Words(core);
            phrase = phrase.join(' ');
            expect(phrase).to.equal(item.phrase);
        })
    });
    it('Phrase To Core', function () {
        testData.forEach(item => {
            let coreFromPhrase = bitmarkCore.parse12Words(item.phrase.split(' '));
            let coreFromHex = Buffer.from(item.hex + '0', 'hex');
            expect(common.bufferEqual(coreFromPhrase, coreFromHex)).to.equal(true);
        })
    });

    it('Core To Base58', function () {
        testData.forEach(item => {
            let coreFromHex = Buffer.from(item.hex + '0', 'hex');
            let base58 = bitmarkCore.exportToBase58(coreFromHex);
            expect(base58).to.equal(item.base58);
        })
    });

    it('Base58 To Core', function () {
        testData.forEach(item => {
            let coreFromHex = Buffer.from(item.hex + '0', 'hex');
            let coreFromBase58 = bitmarkCore.base58ToCore(item.base58);
            expect(common.bufferEqual(coreFromBase58, coreFromHex)).to.equal(true);
            checkSeedKey(coreFromBase58, item);
        })
    });

    function checkSeedKey(core, item) {
        if (item.network == 'ERROR') {
            expect(function () {
                networkUtil.extractNetworkFromCore(core);
            }).to.throw();
        } else {
            let network = networkUtil.extractNetworkFromCore(core);
            expect(network.toUpperCase()).to.equal(item.network.toUpperCase());

            let seedKeys = bitmarkCore.generateSeedKeysFromCore(core, 10, 32);
            expect(seedKeys[9].toString('hex')).to.equal(item.key10);
        }
    }
});
