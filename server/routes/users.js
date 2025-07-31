const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Account = require('../models/Account');
const auth = require('../middleware/auth');

// الحصول على معلومات المستخدم
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'username', 'email', 'phone', 'lastLogin', 'createdAt']
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// تحديث معلومات المستخدم
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // التحقق من البريد الإلكتروني إذا تم تغييره
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'البريد الإلكتروني موجود بالفعل'
        });
      }
    }

    // تحديث البيانات
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (phone) updateData.phone = phone;

    await user.update(updateData);

    res.json({
      success: true,
      message: 'تم تحديث المعلومات بنجاح',
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// تغيير كلمة المرور
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الحالية والجديدة مطلوبة'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'
      });
    }

    const user = await User.findByPk(req.user.id);

    // التحقق من كلمة المرور الحالية
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الحالية غير صحيحة'
      });
    }

    // تحديث كلمة المرور
    await user.update({ password: newPassword });

    res.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// الحصول على إحصائيات المستخدم
router.get('/stats', auth, async (req, res) => {
  try {
    const accounts = await Account.findAll({
      where: {
        userId: req.user.id,
        status: 'نشط'
      }
    });

    const totalBalance = accounts.reduce((sum, account) => {
      return sum + parseFloat(account.balance);
    }, 0);

    const accountTypes = accounts.reduce((acc, account) => {
      acc[account.type] = (acc[account.type] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalAccounts: accounts.length,
        totalBalance,
        accountTypes,
        lastLogin: req.user.lastLogin
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// حذف الحساب
router.delete('/account', auth, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور مطلوبة لحذف الحساب'
      });
    }

    const user = await User.findByPk(req.user.id);

    // التحقق من كلمة المرور
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور غير صحيحة'
      });
    }

    // التحقق من وجود حسابات نشطة
    const activeAccounts = await Account.findAll({
      where: {
        userId: req.user.id,
        status: 'نشط'
      }
    });

    if (activeAccounts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن حذف الحساب مع وجود حسابات نشطة'
      });
    }

    // إلغاء تفعيل الحساب بدلاً من حذفه
    await user.update({ isActive: false });

    res.json({
      success: true,
      message: 'تم حذف الحساب بنجاح'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

module.exports = router;