# MADU Platform Dockerfile
# بناء صورة Docker لمنصة الدينار المغاربي الرقمي

# المرحلة الأولى: بناء التطبيق
FROM node:18-alpine AS builder

# تعيين مجلد العمل
WORKDIR /app

# نسخ ملفات package.json
COPY package*.json ./
COPY blockchain/package*.json ./blockchain/
COPY smart-contracts/package*.json ./smart-contracts/
COPY wallet/package*.json ./wallet/
COPY api/package*.json ./api/
COPY frontend/package*.json ./frontend/

# تثبيت التبعيات
RUN npm ci --only=production && npm cache clean --force

# نسخ الكود المصدري
COPY . .

# بناء المشروع
RUN npm run build

# المرحلة الثانية: صورة الإنتاج
FROM node:18-alpine AS production

# إضافة مستخدم غير جذر للأمان
RUN addgroup -g 1001 -S nodejs
RUN adduser -S madu -u 1001

# تثبيت الأدوات المطلوبة
RUN apk add --no-cache \
    tini \
    curl \
    && rm -rf /var/cache/apk/*

# تعيين مجلد العمل
WORKDIR /app

# نسخ الملفات المبنية من المرحلة الأولى
COPY --from=builder --chown=madu:nodejs /app/dist ./dist
COPY --from=builder --chown=madu:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=madu:nodejs /app/package*.json ./

# نسخ ملفات التكوين الضرورية
COPY --chown=madu:nodejs scripts ./scripts
COPY --chown=madu:nodejs config ./config

# إنشاء المجلدات المطلوبة
RUN mkdir -p /app/uploads /app/logs \
    && chown -R madu:nodejs /app/uploads /app/logs

# التبديل للمستخدم غير الجذر
USER madu

# تعريف المتغيرات البيئية
ENV NODE_ENV=production
ENV PORT=3000

# كشف المنفذ
EXPOSE 3000

# فحص صحة التطبيق
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# نقطة الدخول
ENTRYPOINT ["/sbin/tini", "--"]

# الأمر الافتراضي
CMD ["node", "dist/server.js"]

# ======================
# صورة منفصلة للتطوير
# ======================
FROM node:18-alpine AS development

# تثبيت أدوات التطوير
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# نسخ ملفات package.json
COPY package*.json ./

# تثبيت جميع التبعيات (بما في ذلك devDependencies)
RUN npm ci

# نسخ الكود المصدري
COPY . .

# كشف المنافذ للتطوير
EXPOSE 3000 8545 27017 6379

# أمر التطوير
CMD ["npm", "run", "dev"]

# ======================
# صورة لبناء العقود الذكية
# ======================
FROM node:18-alpine AS contracts

WORKDIR /app

# تثبيت أدوات Solidity
RUN npm install -g truffle ganache-cli

# نسخ العقود الذكية
COPY smart-contracts ./smart-contracts
COPY package*.json ./

RUN cd smart-contracts && npm ci

# أمر ترجمة العقود
CMD ["npm", "run", "contracts:compile"]

# ======================
# Labels للمعلومات
# ======================
LABEL org.opencontainers.image.title="MADU Platform"
LABEL org.opencontainers.image.description="منصة الدينار المغاربي الرقمي - Blockchain Platform"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="MADU Platform Team"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/madu-platform/madu-core"
LABEL maintainer="team@madu-platform.org"