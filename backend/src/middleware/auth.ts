import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/utils/encryption';
import { User } from '@/types';
import { logger } from '@/utils/logger';

// توسيع نوع Request ليشمل المستخدم
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// وسيط المصادقة الأساسي
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'رمز الوصول مطلوب'
      });
      return;
    }

    const token = authHeader.substring(7); // إزالة "Bearer "
    
    // التحقق من التوكن
    const decoded = verifyToken(token) as any;
    
    if (!decoded || !decoded.userId) {
      res.status(401).json({
        success: false,
        message: 'رمز الوصول غير صالح'
      });
      return;
    }

    // إضافة معلومات المستخدم للطلب
    req.user = {
      id: decoded.userId,
      nationalId: decoded.nationalId,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      email: decoded.email,
      phone: decoded.phone,
      userType: decoded.userType,
      status: decoded.status,
      twoFactorEnabled: decoded.twoFactorEnabled,
      createdAt: new Date(decoded.createdAt),
      updatedAt: new Date(decoded.updatedAt)
    };

    next();
  } catch (error) {
    logger.error('خطأ في المصادقة:', error);
    res.status(401).json({
      success: false,
      message: 'رمز الوصول غير صالح'
    });
  }
};

// وسيط المصادقة للقروض
export const loanAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await authMiddleware(req, res, (err) => {
      if (err) return next(err);
      
      // التحقق من أن المستخدم فرد أو مؤسسة
      if (req.user && (req.user.userType === 'individual' || req.user.userType === 'business')) {
        next();
      } else {
        res.status(403).json({
          success: false,
          message: 'غير مسموح لك بطلب قروض'
        });
      }
    });
  } catch (error) {
    logger.error('خطأ في مصادقة القروض:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في المصادقة'
    });
  }
};

// وسيط المصادقة للموظفين
export const employeeAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await authMiddleware(req, res, (err) => {
      if (err) return next(err);
      
      // التحقق من أن المستخدم موظف
      if (req.user && req.user.userType === 'employee') {
        next();
      } else {
        res.status(403).json({
          success: false,
          message: 'غير مسموح لك بالوصول لهذه الصفحة'
        });
      }
    });
  } catch (error) {
    logger.error('خطأ في مصادقة الموظفين:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في المصادقة'
    });
  }
};

// وسيط المصادقة الثنائية
export const twoFactorAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await authMiddleware(req, res, (err) => {
      if (err) return next(err);
      
      // التحقق من تفعيل المصادقة الثنائية
      if (req.user && req.user.twoFactorEnabled) {
        const twoFactorToken = req.headers['x-2fa-token'] as string;
        
        if (!twoFactorToken) {
          res.status(401).json({
            success: false,
            message: 'رمز المصادقة الثنائية مطلوب'
          });
          return;
        }
        
        // هنا يمكن إضافة التحقق من رمز المصادقة الثنائية
        // للتبسيط، سنقبل أي رمز في هذا المثال
        next();
      } else {
        next();
      }
    });
  } catch (error) {
    logger.error('خطأ في المصادقة الثنائية:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في المصادقة الثنائية'
    });
  }
};

// وسيط التحقق من حالة الحساب
export const accountStatusMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await authMiddleware(req, res, (err) => {
      if (err) return next(err);
      
      // التحقق من أن الحساب نشط
      if (req.user && req.user.status === 'active') {
        next();
      } else {
        res.status(403).json({
          success: false,
          message: 'حسابك معطل. يرجى التواصل مع الدعم الفني'
        });
      }
    });
  } catch (error) {
    logger.error('خطأ في التحقق من حالة الحساب:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في التحقق من حالة الحساب'
    });
  }
};

// وسيط تسجيل النشاط
export const activityLogMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await authMiddleware(req, res, (err) => {
      if (err) return next(err);
      
      // تسجيل النشاط
      if (req.user) {
        logger.info(`نشاط المستخدم: ${req.user.id} - ${req.method} ${req.path}`, {
          userId: req.user.id,
          method: req.method,
          path: req.path,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
      }
      
      next();
    });
  } catch (error) {
    logger.error('خطأ في تسجيل النشاط:', error);
    next();
  }
};