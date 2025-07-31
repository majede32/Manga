#!/bin/bash

echo "🇹🇳 منصة البنك البريدي التونسي - إعداد النشر على Vercel"
echo "========================================================"

# التحقق من وجود Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت. يرجى تثبيت Node.js أولاً."
    exit 1
fi

# التحقق من وجود npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm غير مثبت. يرجى تثبيت npm أولاً."
    exit 1
fi

echo "✅ Node.js و npm مثبتان"

# الانتقال إلى مجلد client
cd client

echo "📦 تثبيت التبعيات..."
npm install

echo "🔨 بناء المشروع..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ تم البناء بنجاح!"
    echo "📁 مجلد البناء: build/"
    echo ""
    echo "🚀 جاهز للنشر على Vercel!"
    echo ""
    echo "📋 خطوات النشر على Vercel:"
    echo "1. اذهب إلى vercel.com"
    echo "2. اختر 'New Project'"
    echo "3. اربط GitHub أو ارفع مجلد build"
    echo "4. إعدادات البناء:"
    echo "   - Framework Preset: Other"
    echo "   - Build Command: cd client && npm install && npm run build"
    echo "   - Output Directory: client/build"
    echo ""
    echo "🔗 أو استخدم Vercel CLI:"
    echo "npm i -g vercel"
    echo "vercel"
else
    echo "❌ فشل في البناء. تحقق من الأخطاء أعلاه."
    exit 1
fi