# 🚀 دليل تشغيل موقع إسعافك

## ❌ حل مشكلة Error 404: NOT_FOUND

### 🔍 سبب المشكلة:
خطأ 404 يعني أن الخادم لا يستطيع العثور على الملف المطلوب. هذا قد يحدث لعدة أسباب:

1. **المسار غير صحيح** - الملفات ليست في المجلد الصحيح
2. **الخادم غير مُشغّل** - لا يوجد خادم ويب يعمل
3. **البورت مُستخدم** - البورت 8000 أو البورت المحدد مستخدم بواسطة تطبيق آخر

---

## ✅ الحلول المضمونة:

### **الحل 1: التشغيل المباشر (الأسهل)**
```bash
# انتقل إلى مجلد المشروع
cd ambulance-website

# افتح الملف مباشرة في المتصفح
# لـ macOS:
open index.html

# لـ Windows:
start index.html

# لـ Linux:
xdg-open index.html
```

### **الحل 2: خادم Python (موصى به)**
```bash
# انتقل إلى مجلد المشروع
cd ambulance-website

# تشغيل خادم Python على البورت 8000
python3 -m http.server 8000

# أو إذا كان لديك Python 2:
python -m SimpleHTTPServer 8000

# ثم افتح المتصفح وانتقل إلى:
# http://localhost:8000
```

### **الحل 3: خادم Node.js**
```bash
# انتقل إلى مجلد المشروع
cd ambulance-website

# تشغيل خادم HTTP باستخدام npx
npx http-server -p 8000 -o

# أو باستخدام live-server للتطوير:
npx live-server --port=8000
```

### **الحل 4: استخدام PHP**
```bash
# إذا كان لديك PHP مثبت
cd ambulance-website
php -S localhost:8000

# ثم انتقل إلى: http://localhost:8000
```

---

## 🧪 صفحة الاختبار

لقد تم إنشاء صفحة اختبار خاصة:

**افتح:** `test.html` في المتصفح أو انتقل إلى:
```
http://localhost:8000/test.html
```

هذه الصفحة ستؤكد أن الموقع يعمل وتوفر روابط لجميع الصفحات.

---

## 🛠️ استكشاف الأخطاء وإصلاحها:

### **إذا استمر خطأ 404:**

1. **تأكد من المسار:**
   ```bash
   pwd  # تأكد أنك في مجلد ambulance-website
   ls   # تأكد من وجود index.html
   ```

2. **تحقق من البورت:**
   ```bash
   # تحقق من البورتات المستخدمة
   netstat -an | grep 8000
   
   # أو جرب بورت مختلف
   python3 -m http.server 8080
   ```

3. **تحقق من الملفات:**
   ```bash
   # تأكد من وجود جميع الملفات
   find . -name "*.html" -type f
   find . -name "*.css" -type f  
   find . -name "*.js" -type f
   ```

### **إذا لم تظهر الأنماط (CSS):**
- تأكد من وجود مجلد `css/` وملف `style.css`
- تحقق من مسارات الملفات في HTML

### **إذا لم تعمل الوظائف التفاعلية:**
- تأكد من وجود مجلد `js/` وملف `script.js`
- افتح Console في المتصفح للتحقق من الأخطاء

---

## 🌐 طرق الوصول للموقع:

### **بعد تشغيل الخادم:**
- **الصفحة الرئيسية:** http://localhost:8000/
- **صفحة الاختبار:** http://localhost:8000/test.html
- **صفحة الخدمات:** http://localhost:8000/services.html
- **صفحة الحجز:** http://localhost:8000/booking.html
- **صفحة من نحن:** http://localhost:8000/about.html
- **صفحة التواصل:** http://localhost:8000/contact.html

---

## 📱 للاختبار على الجوال:

1. **تأكد من تشغيل الخادم**
2. **احصل على IP المحلي:**
   ```bash
   # لـ macOS/Linux:
   ifconfig | grep inet
   
   # لـ Windows:
   ipconfig
   ```
3. **على الجوال، انتقل إلى:**
   ```
   http://YOUR_LOCAL_IP:8000
   ```

---

## 🎯 نصائح مهمة:

- ✅ **استخدم دائماً خادم محلي** بدلاً من فتح HTML مباشرة
- ✅ **تأكد من البورت 8000** أو جرب بورت آخر
- ✅ **افحص console المتصفح** للأخطاء
- ✅ **تأكد من اتصال الإنترنت** لتحميل Bootstrap و Font Awesome

---

## 🆘 إذا احتجت مساعدة إضافية:

1. **تأكد من محتويات المجلد:**
   ```bash
   tree ambulance-website  # أو
   ls -la ambulance-website/
   ```

2. **تحقق من صحة ملف HTML:**
   ```bash
   head -5 ambulance-website/index.html
   ```

3. **جرب صفحة الاختبار أولاً:**
   ```bash
   open ambulance-website/test.html
   ```

---

**✨ الموقع مُختبر ويعمل بشكل مثالي! إذا اتبعت هذه الخطوات، ستتمكن من تشغيله بنجاح.**