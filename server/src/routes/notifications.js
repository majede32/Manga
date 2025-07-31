const express = require('express');
const router = express.Router();

// Mock notifications data
const mockNotifications = [
  {
    id: '1',
    type: 'transaction',
    title: 'تحويل مالي جديد',
    titleEn: 'New Money Transfer',
    message: 'تم تحويل 250 دينار من حسابك الجاري',
    messageEn: 'TND 250 transferred from your current account',
    isRead: false,
    priority: 'medium',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    type: 'security',
    title: 'تسجيل دخول جديد',
    titleEn: 'New Login',
    message: 'تم تسجيل دخول جديد من جهاز غير معروف',
    messageEn: 'New login from an unknown device',
    isRead: true,
    priority: 'high',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    type: 'loan',
    title: 'تحديث طلب القرض',
    titleEn: 'Loan Application Update',
    message: 'تم الموافقة على طلب القرض الخاص بك',
    messageEn: 'Your loan application has been approved',
    isRead: false,
    priority: 'high',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

// GET /api/notifications
router.get('/', (req, res) => {
  const unreadCount = mockNotifications.filter(n => !n.isRead).length;
  
  res.json({
    success: true,
    notifications: mockNotifications,
    unreadCount,
    message: 'Notifications retrieved successfully',
    messageAr: 'تم استرداد الإشعارات بنجاح'
  });
});

// PUT /api/notifications/:id/read
router.put('/:id/read', (req, res) => {
  const notification = mockNotifications.find(n => n.id === req.params.id);
  if (!notification) {
    return res.status(404).json({
      success: false,
      error: 'Notification not found',
      errorAr: 'الإشعار غير موجود'
    });
  }
  
  notification.isRead = true;
  
  res.json({
    success: true,
    message: 'Notification marked as read',
    messageAr: 'تم تمييز الإشعار كمقروء'
  });
});

// PUT /api/notifications/mark-all-read
router.put('/mark-all-read', (req, res) => {
  mockNotifications.forEach(notification => {
    notification.isRead = true;
  });
  
  res.json({
    success: true,
    message: 'All notifications marked as read',
    messageAr: 'تم تمييز جميع الإشعارات كمقروءة'
  });
});

module.exports = router;