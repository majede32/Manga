const express = require('express');
const router = express.Router();
const Account = require('../models/Account');
const User = require('../models/User');
const auth = require('../middleware/auth');

// الحصول على جميع حسابات المستخدم
router.get('/', auth, async (req, res) => {
  try {
    const accounts = await Account.findAll({
      where: { 
        userId: req.user.id,
        status: 'نشط'
      },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// الحصول على حساب محدد
router.get('/:id', auth, async (req, res) => {
  try {
    const account = await Account.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'الحساب غير موجود'
      });
    }

    res.json({
      success: true,
      data: account
    });
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// إنشاء حساب جديد
router.post('/', auth, async (req, res) => {
  try {
    const { type, balance, currency } = req.body;

    // التحقق من البيانات المطلوبة
    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'نوع الحساب مطلوب'
      });
    }

    // التحقق من نوع الحساب
    const validTypes = ['جاري', 'ادخار', 'استثمار'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'نوع الحساب غير صحيح'
      });
    }

    // إنشاء الحساب
    const account = await Account.create({
      type,
      balance: balance || 0,
      currency: currency || 'TND',
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      data: account
    });

  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// تحديث الحساب
router.put('/:id', auth, async (req, res) => {
  try {
    const { type, status, interestRate } = req.body;

    const account = await Account.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'الحساب غير موجود'
      });
    }

    // تحديث البيانات
    const updateData = {};
    if (type) updateData.type = type;
    if (status) updateData.status = status;
    if (interestRate !== undefined) updateData.interestRate = interestRate;

    await account.update(updateData);

    res.json({
      success: true,
      message: 'تم تحديث الحساب بنجاح',
      data: account
    });

  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// إغلاق الحساب
router.delete('/:id', auth, async (req, res) => {
  try {
    const account = await Account.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'الحساب غير موجود'
      });
    }

    // التحقق من أن الحساب فارغ
    if (parseFloat(account.balance) > 0) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن إغلاق الحساب إلا إذا كان فارغاً'
      });
    }

    await account.update({ status: 'مغلق' });

    res.json({
      success: true,
      message: 'تم إغلاق الحساب بنجاح'
    });

  } catch (error) {
    console.error('Close account error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// الحصول على إحصائيات الحسابات
router.get('/stats/summary', auth, async (req, res) => {
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
        accountTypes
      }
    });

  } catch (error) {
    console.error('Get account stats error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

module.exports = router;