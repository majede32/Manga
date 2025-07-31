import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

// فئة الخطأ المخصصة
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// معالج الأخطاء الرئيسي
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'خطأ داخلي في الخادم';
  let isOperational = true;

  // تحديد نوع الخطأ
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    isOperational = error.isOperational;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'بيانات غير صحيحة';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'معرف غير صحيح';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'رمز الوصول غير صالح';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'انتهت صلاحية رمز الوصول';
  } else if (error.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'بيانات غير صحيحة';
  } else if (error.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'البيانات موجودة مسبقاً';
  } else if (error.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'مرجع غير صحيح';
  }

  // تسجيل الخطأ
  logger.error('خطأ في التطبيق:', {
    error: error.message,
    stack: error.stack,
    statusCode,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id
  });

  // إرسال الاستجابة
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      error: error.message
    })
  });
};

// معالج الأخطاء غير المعالجة
export const unhandledRejectionHandler = (reason: any, promise: Promise<any>): void => {
  logger.error('Unhandled Rejection:', {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise
  });
};

// معالج الأخطاء غير المعالجة
export const uncaughtExceptionHandler = (error: Error): void => {
  logger.error('Uncaught Exception:', {
    error: error.message,
    stack: error.stack
  });
  
  process.exit(1);
};

// معالج الأخطاء للطلبات غير الموجودة
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`المسار غير موجود: ${req.originalUrl}`, 404);
  next(error);
};

// معالج أخطاء التحقق من البيانات
export const validationErrorHandler = (error: any, req: Request, res: Response, next: NextFunction): void => {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((err: any) => err.message);
    const message = errors.join(', ');
    
    logger.warn('خطأ في التحقق من البيانات:', {
      errors,
      url: req.url,
      method: req.method,
      body: req.body
    });

    res.status(400).json({
      success: false,
      message,
      errors
    });
  } else {
    next(error);
  }
};

// معالج أخطاء قاعدة البيانات
export const databaseErrorHandler = (error: any, req: Request, res: Response, next: NextFunction): void => {
  if (error.name === 'SequelizeConnectionError') {
    logger.error('خطأ في الاتصال بقاعدة البيانات:', error);
    
    res.status(503).json({
      success: false,
      message: 'خدمة قاعدة البيانات غير متاحة حالياً'
    });
  } else if (error.name === 'SequelizeTimeoutError') {
    logger.error('انتهت مهلة قاعدة البيانات:', error);
    
    res.status(408).json({
      success: false,
      message: 'انتهت مهلة الطلب'
    });
  } else {
    next(error);
  }
};

// معالج أخطاء الملفات
export const fileUploadErrorHandler = (error: any, req: Request, res: Response, next: NextFunction): void => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({
      success: false,
      message: 'حجم الملف كبير جداً'
    });
  } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    res.status(400).json({
      success: false,
      message: 'نوع ملف غير متوقع'
    });
  } else {
    next(error);
  }
};

// معالج أخطاء معدل الطلبات
export const rateLimitErrorHandler = (error: any, req: Request, res: Response, next: NextFunction): void => {
  if (error.statusCode === 429) {
    res.status(429).json({
      success: false,
      message: 'تجاوزت الحد المسموح من الطلبات. يرجى المحاولة لاحقاً'
    });
  } else {
    next(error);
  }
};