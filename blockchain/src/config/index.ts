/**
 * MADU Blockchain Configuration
 * تكوين بلوك تشين الدينار المغاربي
 */

import { IChainConfig, CountryCode, ConsensusAlgorithm } from '../types';

export const MADU_CHAIN_CONFIG: IChainConfig = {
  name: 'Maghreb Arab Digital Unity',
  chainId: 2024,
  currency: {
    name: 'Maghreb Arab Digital Unity',
    symbol: 'MADU',
    decimals: 8,
    totalSupply: 21_000_000_000, // 21 مليار وحدة
    countries: [CountryCode.TUNISIA, CountryCode.LIBYA, CountryCode.ALGERIA]
  },
  genesis: {
    timestamp: 1704067200, // 1 يناير 2024
    initialValidators: [
      // عناوين المُصدّقين الأوليين من البنوك المركزية
      '0x1234567890123456789012345678901234567890', // البنك المركزي التونسي
      '0x2345678901234567890123456789012345678901', // مصرف ليبيا المركزي
      '0x3456789012345678901234567890123456789012', // بنك الجزائر
    ],
    premine: [
      {
        address: '0x1111111111111111111111111111111111111111',
        amount: 1_000_000_000, // مليار للبنك المركزي التونسي
        purpose: 'Central Bank of Tunisia Reserve',
        country: CountryCode.TUNISIA
      },
      {
        address: '0x2222222222222222222222222222222222222222',
        amount: 1_000_000_000, // مليار لمصرف ليبيا المركزي
        purpose: 'Central Bank of Libya Reserve',
        country: CountryCode.LIBYA
      },
      {
        address: '0x3333333333333333333333333333333333333333',
        amount: 1_000_000_000, // مليار لبنك الجزائر
        purpose: 'Bank of Algeria Reserve',
        country: CountryCode.ALGERIA
      },
      {
        address: '0x4444444444444444444444444444444444444444',
        amount: 500_000_000, // نصف مليار للتطوير والبحث
        purpose: 'Development and Research Fund',
        country: CountryCode.TUNISIA // مقر المشروع في تونس
      }
    ],
    difficulty: 4
  },
  consensus: {
    algorithm: ConsensusAlgorithm.PROOF_OF_STAKE,
    blockTime: 15, // 15 ثانية بين الكتل
    minValidators: 3,
    maxValidators: 100,
    slashingPenalty: 0.05, // 5% معاقبة
    rewardDistribution: {
      validator: 0.6, // 60% للمُصدّق
      stakers: 0.3,   // 30% للمُراهنين
      treasury: 0.1   // 10% للخزينة
    }
  },
  network: {
    p2pPort: 30303,
    rpcPort: 8545,
    maxPeers: 50,
    seedNodes: [
      'madu-node-tn.madu-platform.org:30303', // العقدة التونسية
      'madu-node-ly.madu-platform.org:30303', // العقدة الليبية
      'madu-node-dz.madu-platform.org:30303'  // العقدة الجزائرية
    ],
    networkId: 'madu-mainnet'
  }
};

export const TESTNET_CONFIG: IChainConfig = {
  ...MADU_CHAIN_CONFIG,
  name: 'MADU Testnet',
  chainId: 2025,
  network: {
    ...MADU_CHAIN_CONFIG.network,
    networkId: 'madu-testnet',
    seedNodes: [
      'testnet-tn.madu-platform.org:30303',
      'testnet-ly.madu-platform.org:30303',
      'testnet-dz.madu-platform.org:30303'
    ]
  }
};

export const DEVELOPMENT_CONFIG: IChainConfig = {
  ...MADU_CHAIN_CONFIG,
  name: 'MADU Development',
  chainId: 2026,
  consensus: {
    ...MADU_CHAIN_CONFIG.consensus,
    blockTime: 5, // 5 ثواني للتطوير السريع
    minValidators: 1
  },
  network: {
    ...MADU_CHAIN_CONFIG.network,
    networkId: 'madu-dev',
    seedNodes: ['localhost:30303']
  }
};

// متغيرات البيئة
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000'),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/madu-blockchain',
  REDIS_URI: process.env.REDIS_URI || 'redis://localhost:6379',
  JWT_SECRET: process.env.JWT_SECRET || 'madu-secret-key-2024',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'madu-encryption-key-256-bit',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};

// اختيار التكوين المناسب حسب البيئة
export function getChainConfig(): IChainConfig {
  switch (ENV.NODE_ENV) {
    case 'production':
      return MADU_CHAIN_CONFIG;
    case 'test':
      return TESTNET_CONFIG;
    default:
      return DEVELOPMENT_CONFIG;
  }
}

// ثوابت النظام
export const CONSTANTS = {
  // أمان
  MIN_TRANSACTION_FEE: 0.00001, // 0.00001 MADU
  MAX_TRANSACTION_SIZE: 1024 * 1024, // 1MB
  MAX_BLOCK_SIZE: 8 * 1024 * 1024, // 8MB
  
  // شبكة
  PEER_DISCOVERY_INTERVAL: 30000, // 30 ثانية
  BLOCK_SYNC_INTERVAL: 10000, // 10 ثواني
  HEARTBEAT_INTERVAL: 15000, // 15 ثانية
  
  // إجماع
  MIN_STAKE_AMOUNT: 1000, // 1000 MADU كحد أدنى للرهان
  VALIDATOR_COOLDOWN: 24 * 60 * 60 * 1000, // 24 ساعة بالميلي ثانية
  
  // KYC/AML
  KYC_EXPIRY_PERIOD: 365 * 24 * 60 * 60 * 1000, // سنة واحدة
  AML_MONITORING_THRESHOLD: 10000, // 10,000 MADU
  
  // حدود المعاملات حسب مستوى KYC
  TRANSACTION_LIMITS: {
    BASIC: {
      daily: 1000,
      monthly: 10000
    },
    ENHANCED: {
      daily: 10000,
      monthly: 100000
    },
    PREMIUM: {
      daily: 100000,
      monthly: 1000000
    }
  }
};

export default {
  MADU_CHAIN_CONFIG,
  TESTNET_CONFIG,
  DEVELOPMENT_CONFIG,
  ENV,
  getChainConfig,
  CONSTANTS
};