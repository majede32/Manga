/**
 * MADU API Configuration
 * تكوين واجهات برمجية منصة الدينار المغاربي الرقمي
 */

import * as dotenv from 'dotenv';

// تحميل متغيرات البيئة
dotenv.config();

interface Config {
  // Server
  NODE_ENV: string;
  PORT: number;
  HOST: string;
  
  // Frontend
  FRONTEND_URL: string;
  
  // Database
  MONGODB_URI: string;
  DB_NAME: string;
  
  // Redis
  REDIS_URL: string;
  REDIS_PASSWORD?: string;
  
  // JWT
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  
  // Encryption
  ENCRYPTION_KEY: string;
  
  // Blockchain
  MADU_TOKEN_CONTRACT: string;
  MADU_STAKING_CONTRACT: string;
  RPC_URL_TUNISIA: string;
  RPC_URL_LIBYA: string;
  RPC_URL_ALGERIA: string;
  TESTNET_RPC_URL: string;
  
  // Private Keys (for server operations)
  ADMIN_PRIVATE_KEY: string;
  
  // Email
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  
  // File Upload
  MAX_FILE_SIZE: number;
  UPLOAD_PATH: string;
  
  // External APIs
  EXCHANGE_RATE_API_KEY?: string;
  NOTIFICATION_SERVICE_URL?: string;
  
  // KYC/AML
  KYC_API_URL?: string;
  KYC_API_KEY?: string;
  AML_SCREENING_URL?: string;
  
  // Compliance
  BCT_API_URL?: string; // البنك المركزي التونسي
  CBL_API_URL?: string; // مصرف ليبيا المركزي
  BOA_API_URL?: string; // بنك الجزائر
  
  // Security
  RATE_LIMIT_WINDOW: number;
  RATE_LIMIT_MAX: number;
  SESSION_SECRET: string;
  
  // Monitoring
  LOG_LEVEL: string;
  SENTRY_DSN?: string;
}

export const config: Config = {
  // Server Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000'),
  HOST: process.env.HOST || '0.0.0.0',
  
  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/madu-platform',
  DB_NAME: process.env.DB_NAME || 'madu-platform',
  
  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'madu-super-secret-jwt-key-2024',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'madu-refresh-secret-2024',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Encryption
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'madu-encryption-key-256-bit-secure',
  
  // Blockchain Configuration
  MADU_TOKEN_CONTRACT: process.env.MADU_TOKEN_CONTRACT || '',
  MADU_STAKING_CONTRACT: process.env.MADU_STAKING_CONTRACT || '',
  RPC_URL_TUNISIA: process.env.RPC_URL_TUNISIA || 'https://madu-tn.madu-platform.org',
  RPC_URL_LIBYA: process.env.RPC_URL_LIBYA || 'https://madu-ly.madu-platform.org',
  RPC_URL_ALGERIA: process.env.RPC_URL_ALGERIA || 'https://madu-dz.madu-platform.org',
  TESTNET_RPC_URL: process.env.TESTNET_RPC_URL || 'http://testnet.madu-platform.org:8545',
  
  // Private Keys
  ADMIN_PRIVATE_KEY: process.env.ADMIN_PRIVATE_KEY || '',
  
  // Email Configuration
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  
  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
  
  // External APIs
  EXCHANGE_RATE_API_KEY: process.env.EXCHANGE_RATE_API_KEY,
  NOTIFICATION_SERVICE_URL: process.env.NOTIFICATION_SERVICE_URL,
  
  // KYC/AML
  KYC_API_URL: process.env.KYC_API_URL,
  KYC_API_KEY: process.env.KYC_API_KEY,
  AML_SCREENING_URL: process.env.AML_SCREENING_URL,
  
  // Central Banks APIs
  BCT_API_URL: process.env.BCT_API_URL || 'https://api.bct.gov.tn',
  CBL_API_URL: process.env.CBL_API_URL || 'https://api.cbl.gov.ly',
  BOA_API_URL: process.env.BOA_API_URL || 'https://api.bank-of-algeria.dz',
  
  // Security
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  SESSION_SECRET: process.env.SESSION_SECRET || 'madu-session-secret-2024',
  
  // Monitoring
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  SENTRY_DSN: process.env.SENTRY_DSN
};

// تخصيص التكوين حسب البيئة
export const getEnvironmentConfig = () => {
  const baseConfig = { ...config };
  
  switch (config.NODE_ENV) {
    case 'production':
      return {
        ...baseConfig,
        RATE_LIMIT_MAX: 100,
        LOG_LEVEL: 'warn'
      };
      
    case 'test':
      return {
        ...baseConfig,
        MONGODB_URI: process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/madu-test',
        REDIS_URL: process.env.TEST_REDIS_URL || 'redis://localhost:6379/1',
        RATE_LIMIT_MAX: 1000,
        LOG_LEVEL: 'silent'
      };
      
    case 'development':
    default:
      return {
        ...baseConfig,
        RATE_LIMIT_MAX: 1000,
        LOG_LEVEL: 'debug'
      };
  }
};

// التحقق من صحة التكوين
export const validateConfig = (): void => {
  const requiredVars = [
    'JWT_SECRET',
    'ENCRYPTION_KEY',
    'MONGODB_URI'
  ];

  const missingVars = requiredVars.filter(varName => !config[varName as keyof Config]);

  if (missingVars.length > 0) {
    throw new Error(`متغيرات البيئة المطلوبة مفقودة: ${missingVars.join(', ')}`);
  }

  // تحذيرات للمتغيرات الاختيارية المهمة
  const optionalVars = [
    'MADU_TOKEN_CONTRACT',
    'MADU_STAKING_CONTRACT',
    'ADMIN_PRIVATE_KEY'
  ];

  optionalVars.forEach(varName => {
    if (!config[varName as keyof Config]) {
      console.warn(`⚠️  متغير البيئة ${varName} غير محدد`);
    }
  });
};

// ثوابت النظام
export const CONSTANTS = {
  // حدود النظام
  MAX_TRANSACTIONS_PER_BLOCK: 1000,
  MAX_TRANSACTION_SIZE: 1024 * 1024, // 1MB
  MAX_BLOCK_SIZE: 8 * 1024 * 1024, // 8MB
  
  // رسوم افتراضية
  DEFAULT_TRANSACTION_FEE: 0.001, // 0.001 MADU
  MIN_TRANSACTION_AMOUNT: 0.000001, // 0.000001 MADU
  
  // مستويات KYC
  KYC_LIMITS: {
    NONE: {
      daily: 100,
      monthly: 1000
    },
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
  },
  
  // فترات انتهاء الصلاحية
  OTP_EXPIRY: 5 * 60 * 1000, // 5 دقائق
  PASSWORD_RESET_EXPIRY: 60 * 60 * 1000, // ساعة واحدة
  EMAIL_VERIFICATION_EXPIRY: 24 * 60 * 60 * 1000, // 24 ساعة
  
  // أحجام الملفات
  MAX_AVATAR_SIZE: 2 * 1024 * 1024, // 2MB
  MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10MB
  
  // البلدان المدعومة
  SUPPORTED_COUNTRIES: ['TN', 'LY', 'DZ'],
  
  // العملات المدعومة
  SUPPORTED_CURRENCIES: ['MADU', 'TND', 'LYD', 'DZD', 'USD', 'EUR'],
  
  // أنواع الحسابات
  ACCOUNT_TYPES: {
    INDIVIDUAL: 'individual',
    BUSINESS: 'business',
    GOVERNMENT: 'government',
    BANK: 'bank'
  },
  
  // حالات المعاملات
  TRANSACTION_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
  },
  
  // أنواع الإشعارات
  NOTIFICATION_TYPES: {
    TRANSACTION_RECEIVED: 'transaction_received',
    TRANSACTION_SENT: 'transaction_sent',
    TRANSACTION_CONFIRMED: 'transaction_confirmed',
    KYC_APPROVED: 'kyc_approved',
    KYC_REJECTED: 'kyc_rejected',
    SECURITY_ALERT: 'security_alert',
    SYSTEM_MAINTENANCE: 'system_maintenance'
  }
};

// تطبيق التكوين المخصص للبيئة
const environmentConfig = getEnvironmentConfig();
export { environmentConfig as config };

// التحقق من صحة التكوين عند التحميل
if (process.env.NODE_ENV !== 'test') {
  validateConfig();
}