FROM node:16-alpine

WORKDIR /app

# نسخ ملفات التبعيات
COPY package*.json ./

# تثبيت التبعيات
RUN npm install

# نسخ الكود المصدري
COPY . .

# فتح المنفذ
EXPOSE 3000

# تشغيل التطبيق
CMD ["npm", "start"]