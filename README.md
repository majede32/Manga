# منصة البنك البريدي التونسي 🇹🇳

منصة إلكترونية متطورة للبنك البريدي التونسي تقدم خدمات مصرفية متكاملة مع العلم التونسي ونسر قرطاج.

## المميزات 🌟

- **واجهة مستخدم متجاوبة** مع العلم التونسي ونسر قرطاج
- **متعدد اللغات** (عربية، فرنسية، إنجليزية)
- **نظام أمان متقدم** باستخدام JWT
- **إدارة الحسابات** والمعاملات
- **حاسبة القروض** التفاعلية
- **نظام التحويلات** الآمن
- **تصميم عصري** ومتجاوب
- **دعم العلم التونسي** ونسر قرطاج

## التقنيات المستخدمة 🛠️

### Frontend
- **React.js** - مكتبة واجهة المستخدم
- **Tailwind CSS** - إطار عمل CSS
- **i18next** - دعم متعدد اللغات
- **Axios** - طلبات HTTP
- **React Router** - التوجيه
- **React Icons** - الأيقونات

### Backend
- **Node.js** - بيئة التشغيل
- **Express.js** - إطار عمل الخادم
- **Sequelize** - ORM لقاعدة البيانات
- **PostgreSQL** - قاعدة البيانات
- **JWT** - المصادقة
- **bcryptjs** - تشفير كلمات المرور
- **Helmet** - الأمان

## التثبيت والتشغيل 🚀

### متطلبات النظام
- Node.js 16+
- PostgreSQL 13+
- npm أو yarn

### خطوات التثبيت

#### 1. استنسخ المشروع
```bash
git clone <repository-url>
cd postal-bank-platform
```

#### 2. إعداد الواجهة الأمامية
```bash
cd client
npm install
```

#### 3. إعداد الواجهة الخلفية
```bash
cd ../server
npm install
```

#### 4. إعداد قاعدة البيانات
```bash
# تثبيت PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# إنشاء قاعدة البيانات
sudo -u postgres psql
CREATE DATABASE postal_bank;
CREATE USER postal_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE postal_bank TO postal_user;
\q
```

#### 5. إعداد متغيرات البيئة
```bash
# في مجلد server
cp .env.example .env
# عدّل ملف .env بالمعلومات المطلوبة
```

#### 6. تشغيل التطبيق
```bash
# الواجهة الخلفية
cd server
npm start

# الواجهة الأمامية (في terminal آخر)
cd client
npm start
```

### تشغيل باستخدام Docker 🐳

```bash
# بناء وتشغيل جميع الخدمات
docker-compose up --build

# تشغيل في الخلفية
docker-compose up -d
```

## الميزات التفصيلية 📋

### 1. العلم التونسي ونسر قرطاج 🇹🇳
- تصميم العلم التونسي التفاعلي
- نسر قرطاج مع تأثيرات متحركة
- ألوان العلم التونسي (أحمر، أبيض، أخضر)

### 2. نظام المصادقة 🔐
- تسجيل الدخول الآمن
- JWT tokens
- تشفير كلمات المرور
- حماية المسارات

### 3. إدارة الحسابات 💳
- إنشاء حسابات متعددة
- أنواع حسابات مختلفة (جاري، ادخار، استثمار)
- عرض الأرصدة والمعاملات
- إحصائيات مفصلة

### 4. حاسبة القروض 🧮
- حساب القروض الشخصية
- حساب القروض العقارية
- حساب القروض التجارية
- عرض الأقساط الشهرية

### 5. نظام التحويلات 💸
- تحويلات داخلية
- تحويلات خارجية
- تحويلات دولية
- سجل التحويلات

### 6. متعدد اللغات 🌍
- العربية (الافتراضية)
- الفرنسية
- الإنجليزية
- تبديل سلس بين اللغات

## API Endpoints 📡

### المصادقة
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/register` - تسجيل مستخدم جديد
- `POST /api/auth/logout` - تسجيل الخروج

### المستخدمين
- `GET /api/users/profile` - معلومات المستخدم
- `PUT /api/users/profile` - تحديث المعلومات
- `PUT /api/users/change-password` - تغيير كلمة المرور

### الحسابات
- `GET /api/accounts` - قائمة الحسابات
- `POST /api/accounts` - إنشاء حساب جديد
- `GET /api/accounts/:id` - تفاصيل الحساب
- `PUT /api/accounts/:id` - تحديث الحساب

## الأمان 🔒

- **JWT Authentication** - مصادقة آمنة
- **bcrypt Password Hashing** - تشفير كلمات المرور
- **Helmet Security Headers** - حماية من الهجمات
- **CORS Configuration** - إعدادات CORS آمنة
- **Input Validation** - التحقق من المدخلات
- **SQL Injection Protection** - حماية من حقن SQL

## النشر 🌐

### على Netlify (Frontend)
1. اربط مستودع GitHub بـ Netlify
2. أضف متغيرات البيئة:
   - `REACT_APP_API_URL`: رابط API الخاص بك

### على Render (Backend)
1. اربط مستودع GitHub بـ Render
2. أضف متغيرات البيئة:
   - `JWT_SECRET`: مفتاح JWT
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: بيانات قاعدة البيانات

### على VPS
```bash
# تثبيت Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# تشغيل التطبيق
docker-compose up -d
```

## بيانات الاختبار 🧪

### المستخدم التجريبي
- **اسم المستخدم**: admin
- **كلمة المرور**: admin123
- **البريد الإلكتروني**: admin@postalbank.tn

### إنشاء مستخدم جديد
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "محمد أحمد",
    "username": "mohamed123",
    "password": "password123",
    "email": "mohamed@example.com",
    "phone": "123456789"
  }'
```

## المساهمة 🤝

نرحب بالمساهمات! يرجى اتباع الخطوات التالية:

1. Fork المشروع
2. إنشاء فرع للميزة الجديدة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى الفرع (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## الترخيص 📄

هذا المشروع مرخص تحت رخصة MIT. راجع ملف `LICENSE` للتفاصيل.

## الاتصال 📞

- **البريد الإلكتروني**: support@postalbank.tn
- **الهاتف**: +216 71 234 567
- **الموقع**: تونس 🇹🇳

## الشكر 🙏

- العلم التونسي 🇹🇳
- نسر قرطاج 🦅
- مجتمع React.js
- مجتمع Node.js
- Tailwind CSS

---

**🇹🇳 البنك البريدي التونسي - خدمات مصرفية متطورة 🦅**
