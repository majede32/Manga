const express = require('express');
const router = express.Router();

// GET /api/users/profile
router.get('/profile', (req, res) => {
  // Mock user profile data
  const userProfile = {
    id: req.user?.id || 'mock-user-1',
    email: req.user?.email || 'user@example.com',
    firstName: 'أحمد',
    lastName: 'التونسي',
    phoneNumber: '+21612345678',
    nationalId: '12345678',
    dateOfBirth: '1990-01-01',
    address: 'تونس العاصمة، تونس',
    role: 'customer',
    isVerified: true,
    twoFactorEnabled: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
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

  res.json({
    success: true,
    user: userProfile,
    message: 'Profile retrieved successfully',
    messageAr: 'تم استرداد الملف الشخصي بنجاح'
  });
});

// PUT /api/users/profile
router.put('/profile', (req, res) => {
  const { firstName, lastName, address, preferences } = req.body;
  
  // Mock profile update
  const updatedProfile = {
    id: req.user?.id || 'mock-user-1',
    email: req.user?.email || 'user@example.com',
    firstName: firstName || 'أحمد',
    lastName: lastName || 'التونسي',
    phoneNumber: '+21612345678',
    nationalId: '12345678',
    dateOfBirth: '1990-01-01',
    address: address || 'تونس العاصمة، تونس',
    role: 'customer',
    isVerified: true,
    twoFactorEnabled: false,
    updatedAt: new Date().toISOString(),
    preferences: preferences || {
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

  res.json({
    success: true,
    user: updatedProfile,
    message: 'Profile updated successfully',
    messageAr: 'تم تحديث الملف الشخصي بنجاح'
  });
});

module.exports = router;