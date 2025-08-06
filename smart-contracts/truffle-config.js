/**
 * Truffle Configuration for MADU Platform
 * تكوين نشر العقود الذكية للدينار المغاربي الرقمي
 */

const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

module.exports = {
  networks: {
    // شبكة التطوير المحلية
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gas: 8000000,
      gasPrice: 20000000000, // 20 gwei
      timeoutBlocks: 200,
      skipDryRun: true
    },

    // شبكة الاختبار
    madu_testnet: {
      provider: () => new HDWalletProvider({
        mnemonic: process.env.TESTNET_MNEMONIC,
        providerOrUrl: process.env.TESTNET_RPC_URL || "http://testnet.madu-platform.org:8545",
        numberOfAddresses: 10
      }),
      network_id: 2025,
      gas: 8000000,
      gasPrice: 20000000000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },

    // الشبكة الرئيسية - تونس
    madu_tunisia: {
      provider: () => new HDWalletProvider({
        mnemonic: process.env.MAINNET_MNEMONIC,
        providerOrUrl: process.env.TUNISIA_RPC_URL || "https://madu-tn.madu-platform.org",
        numberOfAddresses: 5
      }),
      network_id: 2024,
      gas: 6000000,
      gasPrice: 20000000000,
      confirmations: 10,
      timeoutBlocks: 200,
      production: true
    },

    // الشبكة الرئيسية - ليبيا
    madu_libya: {
      provider: () => new HDWalletProvider({
        mnemonic: process.env.MAINNET_MNEMONIC,
        providerOrUrl: process.env.LIBYA_RPC_URL || "https://madu-ly.madu-platform.org",
        numberOfAddresses: 5
      }),
      network_id: 2024,
      gas: 6000000,
      gasPrice: 20000000000,
      confirmations: 10,
      timeoutBlocks: 200,
      production: true
    },

    // الشبكة الرئيسية - الجزائر
    madu_algeria: {
      provider: () => new HDWalletProvider({
        mnemonic: process.env.MAINNET_MNEMONIC,
        providerOrUrl: process.env.ALGERIA_RPC_URL || "https://madu-dz.madu-platform.org",
        numberOfAddresses: 5
      }),
      network_id: 2024,
      gas: 6000000,
      gasPrice: 20000000000,
      confirmations: 10,
      timeoutBlocks: 200,
      production: true
    }
  },

  // إعدادات المترجم
  compilers: {
    solc: {
      version: "0.8.21",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: "london"
      }
    }
  },

  // إعدادات قاعدة البيانات
  db: {
    enabled: false
  },

  // إعدادات المكونات الإضافية
  plugins: [
    "truffle-plugin-verify",
    "@truffle/verify"
  ],

  // إعدادات التحقق من العقود
  api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY,
    bscscan: process.env.BSCSCAN_API_KEY
  },

  // مجلدات المشروع
  contracts_directory: './contracts/',
  contracts_build_directory: './build/contracts/',
  migrations_directory: './migrations/',
  test_directory: './test/',

  // إعدادات الشبكة الافتراضية
  dashboard: {
    port: 24012,
    host: "localhost"
  }
};