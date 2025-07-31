import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// تحميل متغيرات البيئة
dotenv.config();

// استيراد التكوينات
import { config } from '@/config/database';
import { logger } from '@/utils/logger';

// استيراد المسارات
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/users';
import accountRoutes from '@/routes/accounts';
import transactionRoutes from '@/routes/transactions';
import loanRoutes from '@/routes/loans';
import notificationRoutes from '@/routes/notifications';

// استيراد الوسائط
import { errorHandler } from '@/middleware/errorHandler';
import { rateLimiter } from '@/middleware/rateLimiter';
import { authMiddleware } from '@/middleware/auth';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// إعدادات الأمان
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// إعدادات CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ضغط الاستجابات
app.use(compression());

// سجلات الطلبات
app.use(morgan('combined', {
  stream: { write: (message: string) => logger.info(message.trim()) }
}));

// تحليل JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// حد معدل الطلبات
app.use(rateLimiter);

// مسارات API
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/accounts', authMiddleware, accountRoutes);
app.use('/api/transactions', authMiddleware, transactionRoutes);
app.use('/api/loans', authMiddleware, loanRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);

// مسار الصحة
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// WebSocket للدردشة الحية
io.on('connection', (socket) => {
  logger.info(`مستخدم متصل: ${socket.id}`);

  socket.on('join_room', (userId: string) => {
    socket.join(`user_${userId}`);
    logger.info(`المستخدم ${userId} انضم إلى الغرفة`);
  });

  socket.on('send_message', (data) => {
    io.to(`user_${data.userId}`).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    logger.info(`مستخدم منفصل: ${socket.id}`);
  });
});

// معالج الأخطاء
app.use(errorHandler);

// معالج المسارات غير الموجودة
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'المسار غير موجود',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  logger.info(`🚀 الخادم يعمل على المنفذ ${PORT}`);
  logger.info(`🌍 البيئة: ${process.env.NODE_ENV}`);
  logger.info(`📊 قاعدة البيانات: ${config.database}`);
});

// معالجة الإغلاق النظيف
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

export default app;