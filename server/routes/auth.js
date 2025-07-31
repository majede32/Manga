const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// تسجيل الدخول
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // التحقق من البيانات المطلوبة
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال اسم المستخدم وكلمة المرور'
      });
    }

    // البحث عن المستخدم
    const user = await User.findOne({ 
      where: { 
        username: username.toLowerCase(),
        isActive: true
      } 
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
      });
    }

    // التحقق من كلمة المرور
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
      });
    }

    // تحديث آخر تسجيل دخول
    await user.update({ lastLogin: new Date() });

    // إنشاء JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// تسجيل مستخدم جديد
router.post('/register', async (req, res) => {
  try {
    const { name, username, password, email, phone } = req.body;

    // التحقق من البيانات المطلوبة
    if (!name || !username || !password || !email) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول مطلوبة'
      });
    }

    // التحقق من طول كلمة المرور
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
      });
    }

    // التحقق من وجود المستخدم
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { username: username.toLowerCase() },
          { email: email.toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'اسم المستخدم أو البريد الإلكتروني موجود بالفعل'
      });
    }

    // إنشاء المستخدم
    const user = await User.create({
      name,
      username: username.toLowerCase(),
      password,
      email: email.toLowerCase(),
      phone
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// تسجيل الخروج
router.post('/logout', auth, async (req, res) => {
  try {
    // في الواقع، يمكن إضافة token إلى قائمة سوداء
    res.json({
      success: true,
      message: 'تم تسجيل الخروج بنجاح'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

// التحقق من صحة Token
router.get('/verify', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Token صالح',
      user: {
        id: req.user.id,
        name: req.user.name,
        username: req.user.username,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
});

module.exports = router;