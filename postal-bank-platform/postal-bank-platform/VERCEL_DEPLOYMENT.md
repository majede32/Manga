# دليل النشر على Vercel 🇹🇳

## إعداد المشروع للنشر على Vercel

### 1. الملفات المطلوبة ✅

#### vercel.json (في المجلد الرئيسي)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/client/build/static/$1"
    },
    {
      "src": "/favicon.ico",
      "dest": "/client/build/favicon.ico"
    },
    {
      "src": "/manifest.json",
      "dest": "/client/build/manifest.json"
    },
    {
      "src": "/(.*)",
      "dest": "/client/build/index.html"
    }
  ]
}
```

#### client/public/_redirects
```
/*    /index.html   200
```

### 2. خطوات النشر 🚀

#### الطريقة الأولى: رفع الملفات يدوياً

1. **بناء المشروع**:
```bash
cd client
npm install
npm run build
```

2. **رفع مجلد build**:
   - اذهب إلى vercel.com
   - اسحب مجلد `build` إلى منطقة الرفع
   - انتظر النشر

#### الطريقة الثانية: ربط GitHub (مُوصى به)

1. **رفع المشروع إلى GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

2. **ربط Vercel بـ GitHub**:
   - اذهب إلى vercel.com
   - اختر "New Project"
   - اختر GitHub واختر المستودع
   - إعدادات البناء:
     - Framework Preset: Other
     - Build Command: `cd client && npm install && npm run build`
     - Output Directory: `client/build`
     - Install Command: `cd client && npm install`

### 3. إعدادات Vercel المطلوبة ⚙️

#### متغيرات البيئة (Environment Variables):
```
REACT_APP_API_URL=https://your-backend-url.com
```

#### إعدادات البناء:
- **Framework Preset**: Other
- **Build Command**: `cd client && npm install && npm run build`
- **Output Directory**: `client/build`
- **Install Command**: `cd client && npm install`

### 4. اختبار النشر ✅

بعد النشر، تأكد من أن الروابط التالية تعمل:
- `/` - الصفحة الرئيسية
- `/login` - صفحة تسجيل الدخول مع العلم التونسي
- `/dashboard` - لوحة التحكم (بعد تسجيل الدخول)
- `/loans` - صفحة القروض
- `/transfers` - صفحة التحويلات

### 5. استكشاف الأخطاء 🔧

#### إذا ظهرت رسالة "Page not found":

1. **تحقق من ملف vercel.json**:
   - تأكد من وجود الملف في المجلد الرئيسي
   - تحقق من إعدادات routes

2. **تحقق من إعدادات البناء**:
   - اذهب إلى Project Settings > General
   - تحقق من Build Command و Output Directory

3. **إعادة نشر المشروع**:
   - اذهب إلى Deployments
   - اختر "Redeploy"

#### إذا لم تظهر الصفحات:

1. **تحقق من Console**:
   - افتح Developer Tools
   - تحقق من وجود أخطاء في Console

2. **تحقق من Network**:
   - تأكد من تحميل جميع الملفات
   - تحقق من حالة API calls

### 6. الملفات المهمة 📁

```
/
├── vercel.json              # إعدادات Vercel
├── client/
│   ├── public/
│   │   ├── _redirects       # إعادة توجيه
│   │   ├── 404.html         # صفحة 404 مخصصة
│   │   └── index.html       # الصفحة الرئيسية
│   ├── package.json         # تبعيات المشروع
│   └── src/
│       └── App.js           # إعدادات React Router
```

### 7. مزايا Vercel 🌟

- **نشر سريع**: نشر تلقائي عند تحديث GitHub
- **CDN عالمي**: تحميل سريع من أي مكان
- **SSL مجاني**: شهادات SSL تلقائية
- **تحليلات متقدمة**: إحصائيات مفصلة
- **دعم React**: تحسينات خاصة بـ React

### 8. الدعم 💬

إذا واجهت أي مشاكل:
1. تحقق من Console في المتصفح
2. تحقق من Vercel logs
3. تأكد من إعدادات Build
4. جرب إعادة نشر المشروع

---

**🇹🇳 البنك البريدي التونسي - خدمات مصرفية متطورة 🦅**