/**
 * MADU Platform API Server
 * خادم واجهات برمجية للدينار المغاربي الرقمي
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { config } from './config';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { validateRequest } from './middleware/validation';

// Routes
import authRoutes from './routes/auth';
import walletRoutes from './routes/wallet';
import transactionRoutes from './routes/transaction';
import blockchainRoutes from './routes/blockchain';
import stakingRoutes from './routes/staking';
import complianceRoutes from './routes/compliance';
import adminRoutes from './routes/admin';
import bankingRoutes from './routes/banking';

class MADUServer {
  public app: Application;
  public server: any;
  public io: Server;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: config.FRONTEND_URL,
        methods: ["GET", "POST"]
      }
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupSwagger();
    this.setupErrorHandling();
  }

  /**
   * إعداد البرمجيات الوسطية
   */
  private setupMiddleware(): void {
    // أمان
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS
    this.app.use(cors({
      origin: config.NODE_ENV === 'production' 
        ? [config.FRONTEND_URL] 
        : true,
      credentials: true
    }));

    // ضغط الاستجابات
    this.app.use(compression());

    // تسجيل الطلبات
    this.app.use(morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) }
    }));

    // تحليل JSON
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // تحديد معدل الطلبات
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 دقيقة
      max: config.NODE_ENV === 'production' ? 100 : 1000, // 100 طلب في البيئة الإنتاجية
      message: 'تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة لاحقاً',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // فحص صحة الخدمة
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'MADU API',
        version: process.env.npm_package_version || '1.0.0'
      });
    });
  }

  /**
   * إعداد المسارات
   */
  private setupRoutes(): void {
    const apiPrefix = '/api/v1';

    // المسارات العامة
    this.app.use(`${apiPrefix}/auth`, authRoutes);
    
    // المسارات المحمية
    this.app.use(`${apiPrefix}/wallet`, authMiddleware, walletRoutes);
    this.app.use(`${apiPrefix}/transaction`, authMiddleware, transactionRoutes);
    this.app.use(`${apiPrefix}/blockchain`, blockchainRoutes);
    this.app.use(`${apiPrefix}/staking`, authMiddleware, stakingRoutes);
    this.app.use(`${apiPrefix}/compliance`, authMiddleware, complianceRoutes);
    this.app.use(`${apiPrefix}/banking`, authMiddleware, bankingRoutes);
    
    // مسارات الإدارة
    this.app.use(`${apiPrefix}/admin`, authMiddleware, adminRoutes);

    // صفحة ترحيب
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        message: 'مرحباً بكم في منصة الدينار المغاربي الرقمي',
        version: '1.0.0',
        documentation: '/api-docs',
        status: 'running'
      });
    });

    // معالجة المسارات غير الموجودة
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: 'المسار المطلوب غير موجود',
        path: req.originalUrl
      });
    });
  }

  /**
   * إعداد WebSocket للإشعارات الفورية
   */
  private setupWebSocket(): void {
    this.io.on('connection', (socket) => {
      logger.info(`عميل متصل: ${socket.id}`);

      // انضمام إلى غرفة المستخدم
      socket.on('join-user', (userId: string) => {
        socket.join(`user:${userId}`);
        logger.info(`المستخدم ${userId} انضم إلى غرفته`);
      });

      // انضمام إلى غرفة الدولة
      socket.on('join-country', (country: string) => {
        socket.join(`country:${country}`);
        logger.info(`انضمام إلى غرفة الدولة: ${country}`);
      });

      // قطع الاتصال
      socket.on('disconnect', () => {
        logger.info(`عميل منقطع: ${socket.id}`);
      });
    });

    // مساعد لإرسال الإشعارات
    this.app.set('io', this.io);
  }

  /**
   * إعداد وثائق Swagger
   */
  private setupSwagger(): void {
    const options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'MADU Platform API',
          version: '1.0.0',
          description: 'واجهات برمجية لمنصة الدينار المغاربي الرقمي',
          contact: {
            name: 'فريق تطوير MADU',
            email: 'api@madu-platform.org'
          }
        },
        servers: [
          {
            url: config.NODE_ENV === 'production' 
              ? 'https://api.madu-platform.org' 
              : `http://localhost:${config.PORT}`,
            description: config.NODE_ENV === 'production' 
              ? 'الخادم الإنتاجي' 
              : 'خادم التطوير'
          }
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
            }
          }
        },
        security: [
          {
            bearerAuth: []
          }
        ]
      },
      apis: ['./src/routes/*.ts', './src/models/*.ts']
    };

    const specs = swaggerJsdoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'MADU API Documentation'
    }));
  }

  /**
   * إعداد معالجة الأخطاء
   */
  private setupErrorHandling(): void {
    this.app.use(errorHandler);

    // معالجة الأخطاء غير المتوقعة
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    // إيقاف نظيف للخادم
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      this.server.close(() => {
        logger.info('Server closed.');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received. Shutting down gracefully...');
      this.server.close(() => {
        logger.info('Server closed.');
        process.exit(0);
      });
    });
  }

  /**
   * بدء تشغيل الخادم
   */
  public async start(): Promise<void> {
    try {
      // اتصال بقاعدة البيانات
      await connectDatabase();
      logger.info('✅ اتصال قاعدة البيانات نجح');

      // اتصال بـ Redis
      await connectRedis();
      logger.info('✅ اتصال Redis نجح');

      // بدء تشغيل الخادم
      this.server.listen(config.PORT, () => {
        logger.info(`🚀 خادم MADU API يعمل على المنفذ ${config.PORT}`);
        logger.info(`📖 الوثائق متوفرة على: http://localhost:${config.PORT}/api-docs`);
        logger.info(`🌍 البيئة: ${config.NODE_ENV}`);
      });

    } catch (error) {
      logger.error('❌ فشل في بدء تشغيل الخادم:', error);
      process.exit(1);
    }
  }

  /**
   * إيقاف الخادم
   */
  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => {
        logger.info('🛑 تم إيقاف خادم MADU API');
        resolve();
      });
    });
  }
}

// إنشاء وبدء تشغيل الخادم
const server = new MADUServer();

if (require.main === module) {
  server.start().catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });
}

export default server;