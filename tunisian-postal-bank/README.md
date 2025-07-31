# منصة البنك البريدي التونسي الإلكترونية | Tunisian Postal Bank Electronic Platform

## نظرة عامة | Overview

منصة إلكترونية متطورة لدعم مشروع البنك البريدي التونسي تهدف لتعزيز الإدماج المالي للأفراد والمؤسسات الصغرى والفئات الهشة في تونس.

An advanced electronic platform supporting the Tunisian Postal Bank project aimed at enhancing financial inclusion for individuals, micro-enterprises, and vulnerable groups in Tunisia.

## الميزات الرئيسية | Key Features

### للأفراد | For Individuals
- ✅ إدارة الحسابات الجارية وحسابات الادخار | Current and savings account management
- ✅ طلب القروض الميسرة | Micro-loan applications
- ✅ التحويلات المالية المحلية والدولية | Local and international money transfers
- ✅ المصادقة الثنائية للأمان | Two-factor authentication for security
- ✅ واجهة متعددة اللغات (عربية، فرنسية، إنجليزية) | Multi-language interface (Arabic, French, English)

### للمؤسسات | For Enterprises
- ✅ إدارة حسابات الأعمال | Business account management
- ✅ خدمات الدفع الإلكتروني | Electronic payment services
- ✅ تقارير مالية مفصلة | Detailed financial reports
- ✅ تكامل مع أنظمة المحاسبة | Accounting system integration

## التقنيات المستخدمة | Technology Stack

### Frontend
- **React.js** with TypeScript
- **Material-UI** for modern UI components
- **Redux Toolkit** for state management
- **i18next** for internationalization
- **PWA** capabilities for mobile optimization

### Backend
- **Node.js** with Express.js
- **PostgreSQL** for primary database
- **MongoDB** for unstructured data
- **JWT** for authentication
- **bcrypt** for password encryption
- **Socket.io** for real-time notifications

### Security
- **SSL/TLS** encryption
- **2FA** authentication
- **PCI-DSS** compliance
- **Rate limiting** and **CORS** protection

## متطلبات النظام | System Requirements

- Node.js 18+
- PostgreSQL 14+
- MongoDB 6+
- Redis (for session management)

## التثبيت والتشغيل | Installation & Setup

```bash
# Clone the repository
git clone https://github.com/tunisia-post/postal-bank-platform.git
cd tunisian-postal-bank-platform

# Install all dependencies
npm run install-deps

# Set up environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env

# Start development servers
npm run dev
```

## البنية المعمارية | Architecture

```
tunisian-postal-bank/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   └── locales/       # Language files
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Custom middleware
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
└── docs/                  # Documentation
```

## الأمان | Security

- جميع كلمات المرور مشفرة باستخدام bcrypt | All passwords encrypted using bcrypt
- المصادقة الثنائية عبر SMS | Two-factor authentication via SMS
- تشفير البيانات أثناء النقل والتخزين | Data encryption in transit and at rest
- مراقبة الأنشطة المشبوهة | Suspicious activity monitoring

## الدعم | Support

للحصول على الدعم الفني، يرجى التواصل معنا:
For technical support, please contact us:

- 📧 Email: support@poste.tn
- 📞 Phone: +216 71 000 000
- 💬 Live Chat: Available 24/7 on the platform

## الترخيص | License

هذا المشروع مرخص تحت رخصة MIT - انظر ملف LICENSE للتفاصيل
This project is licensed under the MIT License - see the LICENSE file for details.

---

**تم تطويره بفخر لخدمة الشعب التونسي | Proudly developed to serve the Tunisian people** 🇹🇳