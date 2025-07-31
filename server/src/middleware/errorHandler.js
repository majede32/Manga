const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    const messageAr = 'المورد غير موجود';
    error = { message, messageAr };
    return res.status(404).json({
      success: false,
      error: message,
      errorAr: messageAr
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    const messageAr = 'تم إدخال قيمة مكررة';
    error = { message, messageAr };
    return res.status(400).json({
      success: false,
      error: message,
      errorAr: messageAr
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    const messageAr = 'خطأ في التحقق من صحة البيانات';
    error = { message, messageAr };
    return res.status(400).json({
      success: false,
      error: message,
      errorAr: messageAr
    });
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(e => e.message);
    const messageAr = 'خطأ في التحقق من صحة البيانات';
    return res.status(400).json({
      success: false,
      error: message,
      errorAr: messageAr
    });
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Duplicate field value entered';
    const messageAr = 'تم إدخال قيمة مكررة';
    return res.status(400).json({
      success: false,
      error: message,
      errorAr: messageAr
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    const messageAr = 'رمز مميز غير صحيح';
    return res.status(401).json({
      success: false,
      error: message,
      errorAr: messageAr
    });
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    const messageAr = 'انتهت صلاحية الرمز المميز';
    return res.status(401).json({
      success: false,
      error: message,
      errorAr: messageAr
    });
  }

  // Banking specific errors
  if (err.code === 'INSUFFICIENT_FUNDS') {
    const message = 'Insufficient funds for this transaction';
    const messageAr = 'رصيد غير كافٍ لهذه المعاملة';
    return res.status(400).json({
      success: false,
      error: message,
      errorAr: messageAr,
      code: 'INSUFFICIENT_FUNDS'
    });
  }

  if (err.code === 'ACCOUNT_BLOCKED') {
    const message = 'Account is blocked. Please contact support.';
    const messageAr = 'الحساب محظور. يرجى الاتصال بالدعم.';
    return res.status(403).json({
      success: false,
      error: message,
      errorAr: messageAr,
      code: 'ACCOUNT_BLOCKED'
    });
  }

  if (err.code === 'DAILY_LIMIT_EXCEEDED') {
    const message = 'Daily transaction limit exceeded';
    const messageAr = 'تم تجاوز الحد اليومي للمعاملات';
    return res.status(400).json({
      success: false,
      error: message,
      errorAr: messageAr,
      code: 'DAILY_LIMIT_EXCEEDED'
    });
  }

  if (err.code === 'INVALID_RECIPIENT') {
    const message = 'Invalid recipient account';
    const messageAr = 'حساب المستفيد غير صحيح';
    return res.status(400).json({
      success: false,
      error: message,
      errorAr: messageAr,
      code: 'INVALID_RECIPIENT'
    });
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    const messageAr = 'الملف كبير جداً';
    return res.status(400).json({
      success: false,
      error: message,
      errorAr: messageAr
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected field';
    const messageAr = 'حقل غير متوقع';
    return res.status(400).json({
      success: false,
      error: message,
      errorAr: messageAr
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = error.message || 'Server Error';
  const messageAr = error.messageAr || 'خطأ في الخادم';

  res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Server Error' : message,
    errorAr: process.env.NODE_ENV === 'production' ? 'خطأ في الخادم' : messageAr,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;