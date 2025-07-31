import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  database: process.env.DATABASE_URL || 'postgresql://tpb_user:tpb_secure_password_2024@localhost:5432/tunisian_postal_bank',
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
  jwt: {
    secret: process.env.JWT_SECRET || 'tpb_jwt_secret_key_2024_very_secure',
    expiresIn: '24h',
    refreshExpiresIn: '7d'
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || ''
    }
  },
  sms: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    fromNumber: process.env.TWILIO_FROM_NUMBER || ''
  },
  payment: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || ''
    },
    paypal: {
      clientId: process.env.PAYPAL_CLIENT_ID || '',
      clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
      mode: process.env.PAYPAL_MODE || 'sandbox'
    }
  },
  app: {
    name: 'Tunisian Postal Bank',
    version: '1.0.0',
    port: parseInt(process.env.PORT || '3001'),
    environment: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
  }
};

// إنشاء اتصال Sequelize
export const sequelize = new Sequelize(config.database, {
  dialect: 'postgres',
  logging: config.app.environment === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: config.app.environment === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

// اختبار الاتصال
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
  } catch (error) {
    console.error('❌ فشل الاتصال بقاعدة البيانات:', error);
    throw error;
  }
};

// مزامنة النماذج مع قاعدة البيانات
export const syncDatabase = async (): Promise<void> => {
  try {
    await sequelize.sync({ alter: config.app.environment === 'development' });
    console.log('✅ تم مزامنة قاعدة البيانات بنجاح');
  } catch (error) {
    console.error('❌ فشل مزامنة قاعدة البيانات:', error);
    throw error;
  }
};