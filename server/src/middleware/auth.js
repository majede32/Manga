const jwt = require('jsonwebtoken');
const { redisUtils } = require('../config/redis');
const logger = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Access denied. No token provided.',
        errorAr: 'تم رفض الوصول. لم يتم توفير رمز مميز.'
      });
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({
        error: 'Access denied. Invalid token format.',
        errorAr: 'تم رفض الوصول. تنسيق الرمز المميز غير صحيح.'
      });
    }

    // Check if token is blacklisted
    const isBlacklisted = await redisUtils.exists(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({
        error: 'Token has been invalidated.',
        errorAr: 'تم إبطال الرمز المميز.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user session exists in Redis
    const userSession = await redisUtils.get(`session:${decoded.id}`);
    if (!userSession) {
      return res.status(401).json({
        error: 'Session expired. Please login again.',
        errorAr: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.'
      });
    }

    // Rate limiting per user
    const userRateKey = `rate_limit:${decoded.id}`;
    const requestCount = await redisUtils.incr(userRateKey);
    
    if (requestCount === 1) {
      await redisUtils.expire(userRateKey, 60); // 1 minute window
    }
    
    if (requestCount > 60) { // 60 requests per minute per user
      logger.securityLog(
        'RATE_LIMIT_EXCEEDED',
        decoded.id,
        req.ip,
        req.get('User-Agent'),
        { requestCount, endpoint: req.path }
      );
      
      return res.status(429).json({
        error: 'Too many requests. Please slow down.',
        errorAr: 'عدد كبير من الطلبات. يرجى التباطؤ.'
      });
    }

    // Extend session if close to expiry
    const sessionTTL = await redisUtils.get(`session_ttl:${decoded.id}`);
    if (sessionTTL && sessionTTL < 300) { // Less than 5 minutes
      await redisUtils.setEx(`session:${decoded.id}`, userSession, 3600); // Extend by 1 hour
      await redisUtils.setEx(`session_ttl:${decoded.id}`, 3600, 3600);
    }

    // Add user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      twoFactorEnabled: decoded.twoFactorEnabled,
      lastLoginAt: decoded.lastLoginAt
    };

    // Log API access for audit trail
    logger.auditLog(
      'API_ACCESS',
      decoded.id,
      {
        method: req.method,
        path: req.path,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      }
    );

    next();
  } catch (error) {
    logger.securityLog(
      'AUTH_ERROR',
      null,
      req.ip,
      req.get('User-Agent'),
      { error: error.message, path: req.path }
    );

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired. Please login again.',
        errorAr: 'انتهت صلاحية الرمز المميز. يرجى تسجيل الدخول مرة أخرى.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token.',
        errorAr: 'رمز مميز غير صحيح.'
      });
    }

    res.status(500).json({
      error: 'Server error during authentication.',
      errorAr: 'خطأ في الخادم أثناء المصادقة.'
    });
  }
};

// Admin role middleware
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    logger.securityLog(
      'UNAUTHORIZED_ADMIN_ACCESS',
      req.user.id,
      req.ip,
      req.get('User-Agent'),
      { path: req.path, userRole: req.user.role }
    );

    return res.status(403).json({
      error: 'Access denied. Admin privileges required.',
      errorAr: 'تم رفض الوصول. صلاحيات المشرف مطلوبة.'
    });
  }
  next();
};

// Employee role middleware
const employeeMiddleware = (req, res, next) => {
  if (!['admin', 'employee'].includes(req.user.role)) {
    logger.securityLog(
      'UNAUTHORIZED_EMPLOYEE_ACCESS',
      req.user.id,
      req.ip,
      req.get('User-Agent'),
      { path: req.path, userRole: req.user.role }
    );

    return res.status(403).json({
      error: 'Access denied. Employee privileges required.',
      errorAr: 'تم رفض الوصول. صلاحيات الموظف مطلوبة.'
    });
  }
  next();
};

// Two-factor authentication check
const twoFactorMiddleware = (req, res, next) => {
  if (req.user.twoFactorEnabled && !req.user.twoFactorVerified) {
    return res.status(403).json({
      error: 'Two-factor authentication required.',
      errorAr: 'المصادقة الثنائية مطلوبة.'
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  employeeMiddleware,
  twoFactorMiddleware
};