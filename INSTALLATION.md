# دليل تثبيت وتشغيل منصة الدينار المغاربي الرقمي (MADU)

## 📋 متطلبات النظام

### متطلبات الأجهزة
- **المعالج**: 4 أنوية على الأقل
- **الذاكرة**: 8 جيجابايت رام كحد أدنى (16 جيجابايت مُفضل)
- **التخزين**: 100 جيجابايت مساحة حرة
- **الشبكة**: اتصال إنترنت مستقر

### متطلبات البرمجيات
- **نظام التشغيل**: Linux Ubuntu 20.04+ / CentOS 8+ / macOS 12+ / Windows 10+
- **Docker**: الإصدار 20.10+
- **Docker Compose**: الإصدار 2.0+
- **Node.js**: الإصدار 18+ (للتطوير المحلي)
- **Git**: أحدث إصدار

## 🚀 التثبيت السريع باستخدام Docker

### 1. استنساخ المستودع
```bash
git clone https://github.com/madu-platform/madu-core.git
cd madu-core
```

### 2. إعداد متغيرات البيئة
```bash
cp .env.example .env
```

قم بتعديل ملف `.env` وإدخال القيم المطلوبة:
```bash
nano .env
```

### 3. تشغيل المنصة
```bash
# تشغيل جميع الخدمات
docker-compose up -d

# مراقبة السجلات
docker-compose logs -f
```

### 4. التحقق من حالة الخدمات
```bash
docker-compose ps
```

### 5. الوصول للمنصة
- **الواجهة الرئيسية**: http://localhost
- **API**: http://localhost:3000
- **وثائق API**: http://localhost:3000/api-docs
- **لوحة المراقبة**: http://localhost:3001
- **إدارة قاعدة البيانات**: http://localhost:8081

## 🛠️ التثبيت للتطوير

### 1. تثبيت التبعيات
```bash
# تثبيت Node.js (باستخدام nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# تثبيت تبعيات المشروع
npm install
```

### 2. إعداد قواعد البيانات المحلية
```bash
# تشغيل MongoDB
docker run -d --name madu-mongo -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=admin123 mongo:7.0

# تشغيل Redis
docker run -d --name madu-redis -p 6379:6379 redis:7.2-alpine redis-server --requirepass redis123

# تشغيل Ganache للبلوك تشين المحلي
npx ganache --host 0.0.0.0 --port 8545 --networkId 2026
```

### 3. بناء وتشغيل المكونات
```bash
# بناء جميع المكونات
npm run build

# تشغيل وضع التطوير
npm run dev
```

## ⚙️ إعداد العقود الذكية

### 1. ترجمة العقود
```bash
cd smart-contracts
npm install
npm run compile
```

### 2. نشر العقود على الشبكة المحلية
```bash
npm run deploy
```

### 3. نشر على شبكة الاختبار
```bash
# تعديل truffle-config.js بمعلومات الشبكة
npm run deploy -- --network madu_testnet
```

## 🌐 إعداد البيئة الإنتاجية

### 1. تحضير الخادم
```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# تثبيت Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# إضافة المستخدم لمجموعة Docker
sudo usermod -aG docker $USER
```

### 2. إعداد شهادات SSL
```bash
# إنشاء مجلد SSL
mkdir -p nginx/ssl

# استخدام Let's Encrypt
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/
```

### 3. تكوين البيئة الإنتاجية
```bash
# نسخ ملف البيئة الإنتاجية
cp .env.example .env.production

# تعديل المتغيرات للإنتاج
nano .env.production
```

### 4. نشر المنصة
```bash
# بناء الصور
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# تشغيل الخدمات
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🔧 التكوين المتقدم

### إعداد البنوك المركزية

#### 1. البنك المركزي التونسي
```bash
# إضافة مفاتيح API البنك المركزي التونسي
export BCT_API_URL="https://api.bct.gov.tn"
export BCT_API_KEY="your-bct-api-key"
```

#### 2. مصرف ليبيا المركزي
```bash
export CBL_API_URL="https://api.cbl.gov.ly"
export CBL_API_KEY="your-cbl-api-key"
```

#### 3. بنك الجزائر
```bash
export BOA_API_URL="https://api.bank-of-algeria.dz"
export BOA_API_KEY="your-boa-api-key"
```

### إعداد خدمات KYC/AML
```bash
# إعداد خدمة التحقق من الهوية
export KYC_API_URL="https://kyc-provider.com/api"
export KYC_API_KEY="your-kyc-api-key"

# إعداد خدمة فحص غسيل الأموال
export AML_SCREENING_URL="https://aml-provider.com/api"
export AML_API_KEY="your-aml-api-key"
```

## 📊 المراقبة والصيانة

### مراقبة الأداء
```bash
# عرض استخدام الموارد
docker stats

# مراقبة السجلات
docker-compose logs -f api

# فحص صحة الخدمات
curl http://localhost:3000/health
```

### النسخ الاحتياطي
```bash
# نسخ احتياطي لقاعدة البيانات
docker exec madu-mongodb mongodump --out /backup --authenticationDatabase admin -u admin -p admin123

# نسخ احتياطي للملفات المرفوعة
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/

# نسخ احتياطي للتكوين
tar -czf config_backup_$(date +%Y%m%d).tar.gz .env nginx/ monitoring/
```

### التحديث
```bash
# سحب أحدث التحديثات
git pull origin main

# إعادة بناء الصور
docker-compose build --no-cache

# تحديث الخدمات
docker-compose up -d
```

## 🔒 الأمان والامتثال

### تشديد الأمان
```bash
# تشفير البيانات الحساسة
export ENCRYPTION_KEY=$(openssl rand -hex 32)

# إنشاء مفاتيح JWT آمنة
export JWT_SECRET=$(openssl rand -base64 64)
export JWT_REFRESH_SECRET=$(openssl rand -base64 64)

# إعداد جدار الحماية
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### إعداد التدقيق
```bash
# تفعيل تدقيق قاعدة البيانات
echo "db.adminCommand({auditConfig: {log: 'file'}})" | docker exec -i madu-mongodb mongosh

# تدقيق العقود الذكية
cd smart-contracts
npm run verify
```

## ❓ حل المشاكل الشائعة

### خطأ في اتصال قاعدة البيانات
```bash
# فحص حالة MongoDB
docker exec madu-mongodb mongosh --eval "db.adminCommand('ping')"

# إعادة تشغيل MongoDB
docker-compose restart mongodb
```

### خطأ في شبكة البلوك تشين
```bash
# فحص حالة Ganache
curl -X POST --data '{"jsonrpc":"2.0","method":"net_version","params":[],"id":1}' http://localhost:8545

# إعادة تشغيل Ganache
docker-compose restart ganache
```

### خطأ في تثبيت التبعيات
```bash
# مسح التبعيات وإعادة التثبيت
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## 📞 الدعم التقني

في حالة مواجهة مشاكل:

1. **راجع السجلات**: `docker-compose logs -f`
2. **تحقق من الوثائق**: [docs.madu-platform.org](https://docs.madu-platform.org)
3. **المنتدى المجتمعي**: [community.madu-platform.org](https://community.madu-platform.org)
4. **البريد الإلكتروني**: support@madu-platform.org
5. **التلجرام**: @MADUPlatformSupport

## 🎯 الخطوات التالية

بعد التثبيت الناجح:

1. **إنشاء حسابات المديرين**
2. **تكوين البنوك المركزية**
3. **رفع العقود الذكية للشبكة الرئيسية**
4. **تفعيل خدمات KYC/AML**
5. **بدء الاختبار التجريبي**

---

*للمزيد من المعلومات، راجع [الوثائق الكاملة](docs/) أو [README.md](README.md)*