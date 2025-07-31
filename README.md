# منصة البنك البريدي التونسي الإلكترونية

## نظرة عامة
منصة إلكترونية متطورة لدعم مشروع البنك البريدي التونسي، مصممة لتوفير خدمات مالية شاملة للأفراد والمؤسسات الصغرى والفئات الهشة.

## المميزات الرئيسية
- إدارة الحسابات الجارية وحسابات الادخار
- طلب وإدارة القروض الميسرة
- التحويلات المالية المحلية والدولية
- واجهة متعددة اللغات (عربية، فرنسية، إنجليزية)
- تصميم متجاوب للهواتف والأجهزة اللوحية
- نظام أمان متقدم مع مصادقة ثنائية

## التقنيات المستخدمة
- **Frontend**: React.js, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL, Redis
- **Authentication**: JWT, 2FA
- **Payment**: Stripe, PayPal
- **Deployment**: Docker, AWS

## هيكل المشروع
```
tunisian-postal-bank/
├── frontend/          # تطبيق React
├── backend/           # خادم Node.js
├── mobile/            # تطبيق React Native
├── docs/              # الوثائق
└── docker/            # ملفات Docker
```

## التثبيت والتشغيل

### المتطلبات
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Docker & Docker Compose

### التثبيت السريع
```bash
# استنساخ المشروع
git clone https://github.com/tunisian-postal-bank/platform.git
cd platform

# تشغيل بالدوكر
docker-compose up -d

# أو التثبيت اليدوي
npm install
npm run dev
```

## المساهمة
نرحب بالمساهمات! يرجى قراءة [دليل المساهمة](CONTRIBUTING.md) للمزيد من المعلومات.

## الترخيص
هذا المشروع مرخص تحت رخصة MIT.

## الدعم
للحصول على الدعم، يرجى التواصل معنا عبر:
- البريد الإلكتروني: support@tunisianpostalbank.tn
- الهاتف: +216 XX XXX XXX
