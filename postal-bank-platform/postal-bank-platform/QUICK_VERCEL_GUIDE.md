# دليل سريع للنشر على Vercel 🇹🇳

## المشكلة والحل

إذا واجهت مشكلة في النشر على Vercel، اتبع هذه الخطوات:

## الحلول المطبقة ✅

### 1. ملف vercel.json
تم إنشاء `vercel.json` في المجلد الرئيسي مع الإعدادات الصحيحة.

### 2. ملف _redirects
تم إنشاء `client/public/_redirects` لحل مشكلة React Router.

### 3. تحديث package.json
تم إضافة script البناء لـ Vercel.

## خطوات النشر السريعة 🚀

### الطريقة الأولى: رفع يدوي

1. **بناء المشروع**:
```bash
cd client
npm install
npm run build
```

2. **رفع مجلد build**:
   - اذهب إلى vercel.com
   - اسحب مجلد `build` إلى منطقة الرفع

### الطريقة الثانية: ربط GitHub (مُوصى به)

1. **رفع إلى GitHub**:
```bash
git add .
git commit -m "Add Vercel support"
git push
```

2. **في Vercel**:
   - New Project
   - اختر GitHub والمستودع
   - إعدادات البناء:
     - Framework Preset: **Other**
     - Build Command: `cd client && npm install && npm run build`
     - Output Directory: `client/build`
     - Install Command: `cd client && npm install`

## إعدادات مهمة ⚙️

### متغيرات البيئة (اختياري):
```
REACT_APP_API_URL=https://your-backend-url.com
```

### إعدادات البناء:
- **Framework Preset**: Other
- **Build Command**: `cd client && npm install && npm run build`
- **Output Directory**: `client/build`
- **Install Command**: `cd client && npm install`

## اختبار النشر ✅

بعد النشر، تأكد من عمل هذه الروابط:
- `/` - الصفحة الرئيسية
- `/login` - تسجيل الدخول مع العلم التونسي
- `/dashboard` - لوحة التحكم
- `/loans` - صفحة القروض
- `/transfers` - صفحة التحويلات

## استكشاف الأخطاء 🔧

### إذا ظهرت "Page not found":
1. تحقق من وجود ملف `vercel.json`
2. تحقق من إعدادات routes
3. أعد نشر المشروع

### إذا فشل البناء:
1. تحقق من Build Command
2. تحقق من Output Directory
3. تحقق من Console logs

## الملفات المهمة 📁

```
/
├── vercel.json              # إعدادات Vercel
├── .vercelignore           # ملفات لتجاهلها
├── client/
│   ├── public/
│   │   └── _redirects      # إعادة توجيه
│   └── package.json        # تبعيات المشروع
```

## الدعم 💬

إذا واجهت مشاكل:
1. تحقق من Vercel logs
2. تحقق من إعدادات Build
3. جرب إعادة نشر المشروع

---

**🇹🇳 البنك البريدي التونسي 🦅**