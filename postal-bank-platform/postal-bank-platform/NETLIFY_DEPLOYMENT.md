# دليل النشر على Netlify 🇹🇳

## المشكلة والحل

إذا واجهت مشكلة "Page not found" على Netlify، فهذا بسبب أن React Router يحتاج إلى إعداد خاص للعمل مع Netlify.

## الحلول المطبقة ✅

### 1. ملف _redirects
تم إنشاء ملف `client/public/_redirects` مع المحتوى:
```
/*    /index.html   200
```

### 2. ملف netlify.toml
تم إنشاء ملف `client/netlify.toml` مع الإعدادات:
```toml
[build]
  publish = "build"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. إصلاح React Router
تم تحديث `App.js` لإضافة `basename`:
```javascript
<Router basename={process.env.PUBLIC_URL}>
```

### 4. صفحة 404 مخصصة
تم إنشاء `client/public/404.html` مع العلم التونسي.

## خطوات النشر على Netlify 🚀

### الطريقة الأولى: رفع الملفات يدوياً

1. **بناء المشروع**:
```bash
cd client
npm install
npm run build
```

2. **رفع مجلد build**:
   - اذهب إلى Netlify
   - اسحب مجلد `build` إلى منطقة الرفع
   - انتظر حتى يكتمل النشر

### الطريقة الثانية: ربط GitHub

1. **رفع المشروع إلى GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

2. **ربط Netlify بـ GitHub**:
   - اذهب إلى Netlify
   - اختر "New site from Git"
   - اختر GitHub واختر المستودع
   - إعدادات البناء:
     - Build command: `cd client && npm install && npm run build`
     - Publish directory: `client/build`

## إعدادات Netlify المطلوبة ⚙️

### متغيرات البيئة (Environment Variables):
```
REACT_APP_API_URL=https://your-backend-url.com
NODE_VERSION=16
```

### إعدادات البناء:
- **Build command**: `cd client && npm install && npm run build`
- **Publish directory**: `client/build`
- **Node version**: 16

## اختبار النشر ✅

بعد النشر، تأكد من أن الروابط التالية تعمل:
- `/` - الصفحة الرئيسية
- `/login` - صفحة تسجيل الدخول
- `/dashboard` - لوحة التحكم (بعد تسجيل الدخول)
- `/loans` - صفحة القروض
- `/transfers` - صفحة التحويلات

## استكشاف الأخطاء 🔧

### إذا استمرت مشكلة 404:

1. **تحقق من ملف _redirects**:
   - تأكد من وجود الملف في `client/public/_redirects`
   - تأكد من المحتوى: `/*    /index.html   200`

2. **تحقق من إعدادات Netlify**:
   - اذهب إلى Site settings > Build & deploy
   - تحقق من Build command و Publish directory

3. **إعادة نشر الموقع**:
   - اذهب إلى Deploys
   - اختر "Trigger deploy" > "Clear cache and deploy site"

### إذا لم تظهر الصفحات:

1. **تحقق من Console**:
   - افتح Developer Tools
   - تحقق من وجود أخطاء في Console

2. **تحقق من Network**:
   - تأكد من تحميل جميع الملفات
   - تحقق من حالة API calls

## الملفات المهمة 📁

```
client/
├── public/
│   ├── _redirects          # إعادة توجيه Netlify
│   ├── 404.html           # صفحة 404 مخصصة
│   └── index.html         # الصفحة الرئيسية
├── netlify.toml           # إعدادات Netlify
└── src/
    └── App.js             # إعدادات React Router
```

## الدعم 💬

إذا واجهت أي مشاكل:
1. تحقق من Console في المتصفح
2. تحقق من Netlify logs
3. تأكد من إعدادات Build
4. جرب إعادة نشر الموقع

---

**🇹🇳 البنك البريدي التونسي - خدمات مصرفية متطورة 🦅**