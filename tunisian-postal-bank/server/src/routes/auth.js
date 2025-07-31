const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

const logger = require('../utils/logger');
const { redisUtils } = require('../config/redis');

const router = express.Router();

// Mock user data for development (replace with actual database)
const mockUsers = new Map();

// Validation middleware
const validateRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
  body('firstName').isLength({ min: 2, max: 50 }).trim(),
  body('lastName').isLength({ min: 2, max: 50 }).trim(),
  body('phoneNumber').matches(/^\+216[0-9]{8}$/),
  body('nationalId').isLength({ min: 8, max: 8 }).isNumeric(),
  body('dateOfBirth').isISO8601(),
  body('address').isLength({ min: 10, max: 500 }).trim()
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// POST /api/auth/register
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errorAr: 'فشل في التحقق من البيانات',
        details: errors.array()
      });
    }

    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      nationalId,
      dateOfBirth,
      address
    } = req.body;

    // Check if user already exists
    if (mockUsers.has(email)) {
      return res.status(400).json({
        success: false,
        error: 'User already exists',
        errorAr: 'المستخدم موجود بالفعل'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const userId = crypto.randomUUID();
    const user = {
      id: userId,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phoneNumber,
      nationalId,
      dateOfBirth,
      address,
      role: 'customer',
      isVerified: false,
      isActive: true,
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
      loginAttempts: 0,
      preferences: {
        language: 'ar',
        notifications: {
          email: true,
          sms: true,
          push: true,
          transactionAlerts: true,
          securityAlerts: true,
          marketingEmails: false
        }
      }
    };

    mockUsers.set(email, user);

    // Generate JWT
    const token = jwt.sign(
      {
        id: userId,
        email,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled
      },
      process.env.JWT_SECRET || 'development_secret',
      { expiresIn: process.env.JWT_EXPIRY || '15m' }
    );

    // Store session in Redis
    await redisUtils.setEx(`session:${userId}`, { email, role: user.role }, 3600);

    logger.auditLog('USER_REGISTERED', userId, { email, role: user.role });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      messageAr: 'تم التسجيل بنجاح',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled
      },
      token
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      errorAr: 'فشل في التسجيل'
    });
  }
});

// POST /api/auth/login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errorAr: 'فشل في التحقق من البيانات',
        details: errors.array()
      });
    }

    const { email, password, rememberMe } = req.body;
    const user = mockUsers.get(email);

    if (!user) {
      logger.loginAttempt(email, false, req.ip, req.get('User-Agent'), 'User not found');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        errorAr: 'بيانات الاعتماد غير صحيحة'
      });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(423).json({
        success: false,
        error: `Account locked. Try again in ${remainingTime} minutes`,
        errorAr: `الحساب مقفل. حاول مرة أخرى خلال ${remainingTime} دقيقة`
      });
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
      }
      mockUsers.set(email, user);

      logger.loginAttempt(email, false, req.ip, req.get('User-Agent'), 'Invalid password');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        errorAr: 'بيانات الاعتماد غير صحيحة'
      });
    }

    // Reset login attempts
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date().toISOString();
    mockUsers.set(email, user);

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Generate temporary token for 2FA verification
      const tempToken = jwt.sign(
        { id: user.id, email, twoFactorPending: true },
        process.env.JWT_SECRET || 'development_secret',
        { expiresIn: '10m' }
      );

      logger.securityLog('2FA_REQUIRED', user.id, req.ip, req.get('User-Agent'), {});
      return res.status(200).json({
        success: true,
        requiresTwoFactor: true,
        message: 'Two-factor authentication required',
        messageAr: 'المصادقة الثنائية مطلوبة',
        tempToken
      });
    }

    // Generate JWT
    const tokenExpiry = rememberMe ? '7d' : (process.env.JWT_EXPIRY || '15m');
    const token = jwt.sign(
      {
        id: user.id,
        email,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
        lastLoginAt: user.lastLoginAt
      },
      process.env.JWT_SECRET || 'development_secret',
      { expiresIn: tokenExpiry }
    );

    // Store session in Redis
    const sessionExpiry = rememberMe ? 7 * 24 * 3600 : 3600; // 7 days or 1 hour
    await redisUtils.setEx(`session:${user.id}`, { email, role: user.role }, sessionExpiry);

    logger.loginAttempt(email, true, req.ip, req.get('User-Agent'));
    logger.auditLog('USER_LOGIN', user.id, { ip: req.ip, userAgent: req.get('User-Agent') });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      messageAr: 'تم تسجيل الدخول بنجاح',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        lastLoginAt: user.lastLoginAt
      },
      token
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      errorAr: 'فشل في تسجيل الدخول'
    });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
      const decoded = jwt.decode(token);
      
      if (decoded && decoded.id) {
        // Remove session from Redis
        await redisUtils.del(`session:${decoded.id}`);
        
        // Blacklist token
        const expiry = decoded.exp - Math.floor(Date.now() / 1000);
        if (expiry > 0) {
          await redisUtils.setEx(`blacklist:${token}`, true, expiry);
        }

        logger.auditLog('USER_LOGOUT', decoded.id, { ip: req.ip });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful',
      messageAr: 'تم تسجيل الخروج بنجاح'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(200).json({
      success: true,
      message: 'Logout successful',
      messageAr: 'تم تسجيل الخروج بنجاح'
    });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
        errorAr: 'لم يتم توفير رمز مميز'
      });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'development_secret');
    
    const user = Array.from(mockUsers.values()).find(u => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        errorAr: 'المستخدم غير موجود'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        lastLoginAt: user.lastLoginAt,
        preferences: user.preferences
      }
    });

  } catch (error) {
    logger.error('Get user error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token',
      errorAr: 'رمز مميز غير صحيح'
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication service is healthy',
    messageAr: 'خدمة المصادقة تعمل بشكل سليم',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;