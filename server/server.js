const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const sequelize = require('./config/database');

// استيراد المسارات
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const accountRoutes = require('./routes/accounts');

// تحميل متغيرات البيئة
dotenv.config();

const app = express();

// وسائط الأمان
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
    }
  }
}));

// إعداد CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// وسائط تحليل الطلبات
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// إضافة معلومات الخادم
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'Tunisian Postal Bank 🇹🇳');
  res.setHeader('X-Server', 'Postal Bank API v1.0');
  next();
});

// مسار الصحة
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'الخادم يعمل بشكل طبيعي 🇹🇳',
    timestamp: new Date().toISOString(),
    server: 'Tunisian Postal Bank API',
    version: '1.0.0'
  });
});

// مسار المعلومات
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Tunisian Postal Bank API',
    description: 'منصة البنك البريدي التونسي - خدمات مصرفية متطورة',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    features: [
      'المصادقة الآمنة',
      'إدارة الحسابات',
      'التحويلات',
      'القروض',
      'متعدد اللغات'
    ],
    contact: {
      email: 'support@postalbank.tn',
      phone: '+216 71 234 567'
    }
  });
});

// مسارات API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);

// معالج الأخطاء العام
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'بيانات غير صحيحة',
      errors: err.errors.map(e => e.message)
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'البيانات موجودة بالفعل'
    });
  }

  res.status(500).json({
    success: false,
    message: 'خطأ في الخادم'
  });
});

// معالج 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'المسار غير موجود',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 5000;

// تشغيل الخادم
const startServer = async () => {
  try {
    // اختبار الاتصال بقاعدة البيانات
    await sequelize.authenticate();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');

    // مزامنة النماذج مع قاعدة البيانات
    await sequelize.sync({ alter: true });
    console.log('✅ تم مزامنة النماذج مع قاعدة البيانات');

    // إنشاء مستخدم تجريبي إذا لم يكن موجوداً
    const User = require('./models/User');
    const existingUser = await User.findOne({ where: { username: 'admin' } });
    
    if (!existingUser) {
      await User.create({
        name: 'مدير النظام',
        username: 'admin',
        password: 'admin123',
        email: 'admin@postalbank.tn',
        phone: '123456789'
      });
      console.log('✅ تم إنشاء المستخدم التجريبي');
    }

    app.listen(PORT, () => {
      console.log('🚀 الخادم يعمل على المنفذ', PORT);
      console.log('📱 البيئة:', process.env.NODE_ENV || 'development');
      console.log('🇹🇳 البنك البريدي التونسي');
      console.log('🦅 نسر قرطاج');
      console.log('🔗 API متاح على: http://localhost:' + PORT + '/api');
    });
  } catch (error) {
    console.error('❌ خطأ في بدء الخادم:', error);
    process.exit(1);
  }
};

startServer();