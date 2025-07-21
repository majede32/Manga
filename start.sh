#!/bin/bash

# Script لتشغيل منصة ترخيص التاكسي الجماعي

echo "🚀 بدء تشغيل منصة ترخيصي..."

# إنشاء المجلدات المطلوبة
echo "📁 إنشاء المجلدات المطلوبة..."
mkdir -p uploads archives
sudo mkdir -p /data/db
sudo chown -R mongodb:mongodb /data/db 2>/dev/null || echo "تحذير: لا يمكن تعيين صلاحيات MongoDB"

# التحقق من وجود MongoDB
if ! command -v mongod &> /dev/null; then
    echo "❌ خطأ: MongoDB غير مثبت"
    echo "يرجى تثبيت MongoDB أولاً باستخدام:"
    echo "sudo apt-get update && sudo apt-get install -y mongodb-org"
    exit 1
fi

# تشغيل MongoDB في الخلفية
echo "🍃 تشغيل MongoDB..."
if ! pgrep mongod > /dev/null; then
    mongod --dbpath /data/db --quiet &
    sleep 3
    echo "✅ تم تشغيل MongoDB"
else
    echo "✅ MongoDB يعمل بالفعل"
fi

# تثبيت المتطلبات إذا لم تكن مثبتة
if [ ! -d "node_modules" ]; then
    echo "📦 تثبيت المتطلبات..."
    npm install
fi

# تشغيل التطبيق
echo "🌐 تشغيل خادم التطبيق..."
echo "📍 الموقع: http://localhost:3000"
echo "⏹️  للإيقاف اضغط Ctrl+C"
echo "----------------------------------------"

node app.js