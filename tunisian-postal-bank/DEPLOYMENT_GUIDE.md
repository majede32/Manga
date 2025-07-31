# دليل نشر منصة البنك البريدي التونسي | Deployment Guide

## نظرة عامة | Overview

منصة إلكترونية متطورة للبنك البريدي التونسي تشمل واجهة أمامية بـ React وخادم خلفي بـ Node.js مع دعم كامل للغة العربية والأمان المصرفي.

An advanced electronic platform for the Tunisian Postal Bank featuring a React frontend and Node.js backend with full Arabic support and banking-grade security.

## هيكل المشروع | Project Structure

```
tunisian-postal-bank/
├── client/                    # React TypeScript Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Redux store & slices
│   │   ├── services/        # API service functions
│   │   ├── utils/           # Utility functions
│   │   └── i18n.ts         # Internationalization
├── server/                   # Node.js Express Backend
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── config/         # Database & Redis config
└── README.md               # Project documentation
```

## متطلبات النظام | System Requirements

### الحد الأدنى | Minimum Requirements
- **Node.js**: 18.0+ 
- **PostgreSQL**: 14+
- **MongoDB**: 6.0+ (for logs)
- **Redis**: 6.0+ (for sessions)
- **RAM**: 4GB
- **Storage**: 10GB

### الموصى به | Recommended
- **Node.js**: 20.0+
- **PostgreSQL**: 15+
- **MongoDB**: 7.0+
- **Redis**: 7.0+
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD

## التثبيت والإعداد | Installation & Setup

### 1. استنساخ المستودع | Clone Repository

```bash
git clone https://github.com/tunisia-post/postal-bank-platform.git
cd tunisian-postal-bank
```

### 2. تثبيت التبعيات | Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

### 3. إعداد قواعد البيانات | Database Setup

#### PostgreSQL (Main Database)
```sql
-- Create database
CREATE DATABASE tunisian_postal_bank;

-- Create user
CREATE USER postal_bank_user WITH PASSWORD 'secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE tunisian_postal_bank TO postal_bank_user;
```

#### MongoDB (Logs & Analytics)
```bash
# Start MongoDB service
sudo systemctl start mongod

# Create database (will be created automatically)
```

#### Redis (Sessions & Caching)
```bash
# Start Redis service
sudo systemctl start redis

# Test connection
redis-cli ping
```

### 4. متغيرات البيئة | Environment Variables

#### Server Environment (.env)
```bash
cd server
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tunisian_postal_bank
DB_USER=postal_bank_user
DB_PASSWORD=your_secure_password

# Security
JWT_SECRET=your_super_secret_jwt_key_256_bits_minimum
ENCRYPTION_KEY=your_32_character_encryption_key_here

# Email (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=noreply@poste.tn
EMAIL_PASSWORD=your_email_password

# SMS (Twilio for 2FA)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+216xxxxxxxx
```

#### Client Environment (.env)
```bash
cd client
cp .env.example .env
```

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development
```

### 5. تهيئة قاعدة البيانات | Database Initialization

```bash
# From server directory
npm run seed
```

## التشغيل | Running the Application

### وضع التطوير | Development Mode

```bash
# Start both frontend and backend
npm run dev

# Or start separately:
# Backend (from server directory)
npm run dev

# Frontend (from client directory)  
npm start
```

### وضع الإنتاج | Production Mode

```bash
# Build frontend
cd client && npm run build

# Start backend
cd ../server && npm start
```

## الأمان | Security Features

### 🔐 المصادقة والترخيص | Authentication & Authorization
- JWT tokens with secure expiration
- Two-factor authentication (2FA) via SMS
- Role-based access control (Customer, Employee, Admin)
- Session management with Redis
- Account lockout after failed attempts

### 🛡️ أمان التطبيق | Application Security  
- Helmet.js for security headers
- CORS protection
- Rate limiting (global and per-user)
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### 🔒 أمان البيانات | Data Security
- Password hashing with bcrypt (12 rounds)
- Sensitive data encryption
- Secure token generation
- Audit logging
- Data anonymization for logs

### 🌐 أمان الشبكة | Network Security
- HTTPS enforcement (production)
- Secure cookie settings
- Content Security Policy (CSP)
- Request size limiting
- API endpoint protection

## الميزات الرئيسية | Key Features

### 💳 الخدمات المصرفية | Banking Services
- ✅ Account management (Current & Savings)
- ✅ Money transfers (Local & International)  
- ✅ Loan applications and management
- ✅ Bill payments
- ✅ Transaction history and reporting
- ✅ Real-time balance updates

### 🌍 دعم متعدد اللغات | Multi-language Support
- ✅ Arabic (primary)
- ✅ French 
- ✅ English
- ✅ RTL layout support
- ✅ Cultural number formatting

### 📱 تجربة المستخدم | User Experience
- ✅ Responsive design (Mobile-first)
- ✅ Progressive Web App (PWA)
- ✅ Accessibility features
- ✅ Dark/Light theme support
- ✅ Offline capabilities

### 🔔 الإشعارات | Notifications
- ✅ Real-time notifications via Socket.IO
- ✅ Email notifications
- ✅ SMS alerts for transactions
- ✅ Push notifications (PWA)
- ✅ In-app notification center

## المراقبة والسجلات | Monitoring & Logging

### 📊 Winston Logger Configuration
```javascript
// Logging levels and files
- error.log: Error level messages
- all.log: All application logs
- audit.log: Banking transaction audit trail
- security.log: Security events and threats
```

### 🔍 Real-time Monitoring
```bash
# View logs in real-time
tail -f server/logs/all.log

# Monitor errors
tail -f server/logs/error.log

# Security monitoring
tail -f server/logs/security.log
```

## النسخ الاحتياطي | Backup Strategy

### PostgreSQL Backup
```bash
# Daily backup
pg_dump -h localhost -U postal_bank_user tunisian_postal_bank > backup_$(date +%Y%m%d).sql

# Restore
psql -h localhost -U postal_bank_user tunisian_postal_bank < backup_20241215.sql
```

### MongoDB Backup
```bash
# Backup logs database
mongodump --db tunisian_postal_bank_logs --out /backup/mongodb/

# Restore
mongorestore --db tunisian_postal_bank_logs /backup/mongodb/tunisian_postal_bank_logs/
```

## النشر السحابي | Cloud Deployment

### 🚀 AWS Deployment
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "80:5000"
    environment:
      - NODE_ENV=production
      - DB_HOST=your-rds-endpoint
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### 🔧 Environment-specific Configurations

#### Development
- Hot reloading enabled
- Detailed error messages
- Database seeding available
- Development CORS settings

#### Production  
- Compressed assets
- Error logging only
- Secure cookie settings
- Production database connections

## الاختبار | Testing

### وحدة الاختبار | Unit Testing
```bash
# Backend tests
cd server && npm test

# Frontend tests  
cd client && npm test
```

### اختبار التكامل | Integration Testing
```bash
# API endpoint testing
npm run test:integration

# E2E testing
npm run test:e2e
```

## استكشاف الأخطاء | Troubleshooting

### مشاكل شائعة | Common Issues

#### Connection Issues
```bash
# Check database connection
psql -h localhost -U postal_bank_user -d tunisian_postal_bank

# Check Redis connection
redis-cli ping

# Check MongoDB connection
mongo tunisian_postal_bank_logs
```

#### Performance Issues
```bash
# Monitor memory usage
htop

# Check database queries
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'user@example.com';

# Redis memory usage
redis-cli info memory
```

## الدعم | Support

### 📞 الدعم الفني | Technical Support
- Email: dev-support@poste.tn
- Phone: +216 71 000 000
- Hours: 24/7 for critical issues

### 📚 الموارد | Resources
- [API Documentation](http://localhost:5000/api/docs)
- [User Manual](./docs/user-manual.md)
- [Admin Guide](./docs/admin-guide.md)
- [Security Guidelines](./docs/security.md)

---

## ترخيص | License

هذا المشروع مرخص تحت رخصة MIT. انظر ملف [LICENSE](./LICENSE) للتفاصيل.

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

**تم تطويره بفخر لخدمة الشعب التونسي 🇹🇳**  
**Proudly developed to serve the Tunisian people 🇹🇳**