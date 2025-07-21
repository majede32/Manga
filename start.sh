#!/bin/bash

# Script لتشغيل منصة ترخيص التاكسي الجماعي

echo "🚀 بدء تشغيل منصة ترخيصي..."

# إنشاء المجلدات المطلوبة
echo "📁 إنشاء المجلدات المطلوبة..."
mkdir -p uploads archives

# إنشاء ملف قاعدة البيانات المحلية إذا لم يكن موجوداً
if [ ! -f "database.json" ]; then
    echo "📄 إنشاء ملف قاعدة البيانات المحلية..."
    echo '{"users":[],"applications":[]}' > database.json
fi

# تثبيت المتطلبات إذا لم تكن مثبتة
if [ ! -d "node_modules" ]; then
    echo "📦 تثبيت المتطلبات..."
    npm install
fi

# تشغيل التطبيق
echo "🌐 تشغيل خادم التطبيق..."
echo "📍 الموقع: http://localhost:3000"
echo "💾 قاعدة البيانات: JSON محلي"
echo "⏹️  للإيقاف اضغط Ctrl+C"
echo "----------------------------------------"

node app.js