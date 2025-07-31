import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'redis';
import { config } from '@/config/database';
import { logger } from '@/utils/logger';

// إنشاء عميل Redis
const redisClient = Redis.createClient({
  url: config.redis
});

// حد معدل الطلبات العام
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // حد أقصى 100 طلب لكل IP
  message: {
    success: false,
    message: 'تجاوزت الحد المسموح من الطلبات. يرجى المحاولة لاحقاً'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('تجاوز حد معدل الطلبات:', {
      ip: req.ip,
      url: req.url,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      message: 'تجاوزت الحد المسموح من الطلبات. يرجى المحاولة لاحقاً'
    });
  }
});

// حد معدل الطلبات للمصادقة
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // حد أقصى 5 محاولات تسجيل دخول
  message: {
    success: false,
    message: 'تجاوزت الحد المسموح من محاولات تسجيل الدخول. يرجى المحاولة لاحقاً'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('تجاوز حد معدل طلبات المصادقة:', {
      ip: req.ip,
      url: req.url,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      message: 'تجاوزت الحد المسموح من محاولات تسجيل الدخول. يرجى المحاولة لاحقاً'
    });
  }
});

// حد معدل الطلبات للتحويلات
export const transferRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 10, // حد أقصى 10 تحويلات في الساعة
  message: {
    success: false,
    message: 'تجاوزت الحد المسموح من التحويلات. يرجى المحاولة لاحقاً'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('تجاوز حد معدل التحويلات:', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      userId: (req as any).user?.id
    });
    
    res.status(429).json({
      success: false,
      message: 'تجاوزت الحد المسموح من التحويلات. يرجى المحاولة لاحقاً'
    });
  }
});

// حد معدل الطلبات لطلب القروض
export const loanRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // يوم واحد
  max: 3, // حد أقصى 3 طلبات قروض في اليوم
  message: {
    success: false,
    message: 'تجاوزت الحد المسموح من طلبات القروض. يرجى المحاولة غداً'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('تجاوز حد معدل طلبات القروض:', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      userId: (req as any).user?.id
    });
    
    res.status(429).json({
      success: false,
      message: 'تجاوزت الحد المسموح من طلبات القروض. يرجى المحاولة غداً'
    });
  }
});

// حد معدل الطلبات للرسائل
export const messageRateLimiter = rateLimit({
  windowMs: 60 * 1000, // دقيقة واحدة
  max: 5, // حد أقصى 5 رسائل في الدقيقة
  message: {
    success: false,
    message: 'تجاوزت الحد المسموح من الرسائل. يرجى المحاولة لاحقاً'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('تجاوز حد معدل الرسائل:', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      userId: (req as any).user?.id
    });
    
    res.status(429).json({
      success: false,
      message: 'تجاوزت الحد المسموح من الرسائل. يرجى المحاولة لاحقاً'
    });
  }
});

// حد معدل الطلبات للبحث
export const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000, // دقيقة واحدة
  max: 20, // حد أقصى 20 بحث في الدقيقة
  message: {
    success: false,
    message: 'تجاوزت الحد المسموح من عمليات البحث. يرجى المحاولة لاحقاً'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('تجاوز حد معدل البحث:', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      userId: (req as any).user?.id
    });
    
    res.status(429).json({
      success: false,
      message: 'تجاوزت الحد المسموح من عمليات البحث. يرجى المحاولة لاحقاً'
    });
  }
});

// حد معدل الطلبات للتقارير
export const reportRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 5, // حد أقصى 5 تقارير في الساعة
  message: {
    success: false,
    message: 'تجاوزت الحد المسموح من التقارير. يرجى المحاولة لاحقاً'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('تجاوز حد معدل التقارير:', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      userId: (req as any).user?.id
    });
    
    res.status(429).json({
      success: false,
      message: 'تجاوزت الحد المسموح من التقارير. يرجى المحاولة لاحقاً'
    });
  }
});

// وسيط للتحقق من حد معدل الطلبات المخصص
export const customRateLimiter = (maxRequests: number, windowMs: number) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: {
      success: false,
      message: 'تجاوزت الحد المسموح من الطلبات. يرجى المحاولة لاحقاً'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logger.warn('تجاوز حد معدل الطلبات المخصص:', {
        ip: req.ip,
        url: req.url,
        method: req.method,
        maxRequests,
        windowMs
      });
      
      res.status(429).json({
        success: false,
        message: 'تجاوزت الحد المسموح من الطلبات. يرجى المحاولة لاحقاً'
      });
    }
  });
};

// وسيط للتحقق من حد معدل الطلبات حسب المستخدم
export const userRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return next();
    }

    const rateLimiterRedis = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: `user_rate_limit_${userId}`,
      points: 100, // عدد النقاط
      duration: 60, // مدة النقاط بالثواني
    });

    await rateLimiterRedis.consume(userId);
    next();
  } catch (error) {
    if (error instanceof Error && error.message.includes('too many requests')) {
      logger.warn('تجاوز حد معدل الطلبات للمستخدم:', {
        userId: (req as any).user?.id,
        ip: req.ip,
        url: req.url
      });
      
      res.status(429).json({
        success: false,
        message: 'تجاوزت الحد المسموح من الطلبات. يرجى المحاولة لاحقاً'
      });
    } else {
      next();
    }
  }
};