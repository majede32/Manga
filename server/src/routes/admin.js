const express = require('express');
const { adminMiddleware } = require('../middleware/auth');
const router = express.Router();

// Apply admin middleware to all routes
router.use(adminMiddleware);

// GET /api/admin/dashboard
router.get('/dashboard', (req, res) => {
  // Mock admin dashboard data
  const dashboardData = {
    stats: {
      totalUsers: 15420,
      activeAccounts: 18234,
      totalTransactions: 45678,
      totalLoans: 2345,
      pendingLoans: 123,
      totalBalance: 45678921.50
    },
    recentActivity: [
      {
        id: '1',
        type: 'user_registration',
        description: 'مستخدم جديد سجل في النظام',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        type: 'large_transaction',
        description: 'تحويل كبير بقيمة 50,000 دينار',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        type: 'loan_approval',
        description: 'تمت الموافقة على قرض بقيمة 25,000 دينار',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ],
    systemHealth: {
      database: 'healthy',
      redis: 'healthy',
      server: 'healthy',
      uptime: '99.9%',
      lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  };

  res.json({
    success: true,
    data: dashboardData,
    message: 'Admin dashboard data retrieved successfully',
    messageAr: 'تم استرداد بيانات لوحة تحكم المشرف بنجاح'
  });
});

// GET /api/admin/users
router.get('/users', (req, res) => {
  // Mock users list for admin
  const users = [
    {
      id: 'user-1',
      email: 'ahmad@example.com',
      firstName: 'أحمد',
      lastName: 'التونسي',
      role: 'customer',
      isActive: true,
      isVerified: true,
      createdAt: '2024-01-15T10:30:00.000Z',
      lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      accountsCount: 2,
      totalBalance: 17921.25
    },
    {
      id: 'user-2',
      email: 'fatima@example.com',
      firstName: 'فاطمة',
      lastName: 'بن علي',
      role: 'customer',
      isActive: true,
      isVerified: false,
      createdAt: '2024-02-01T14:20:00.000Z',
      lastLoginAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      accountsCount: 1,
      totalBalance: 5420.75
    }
  ];

  res.json({
    success: true,
    users,
    pagination: {
      total: 15420,
      page: 1,
      limit: 50,
      pages: 309
    },
    message: 'Users list retrieved successfully',
    messageAr: 'تم استرداد قائمة المستخدمين بنجاح'
  });
});

// GET /api/admin/system-status
router.get('/system-status', (req, res) => {
  const systemStatus = {
    server: {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version
    },
    services: {
      database: 'connected',
      redis: 'connected',
      mongodb: 'connected'
    },
    performance: {
      responseTime: '45ms',
      throughput: '150 req/sec',
      errorRate: '0.01%'
    },
    lastUpdate: new Date().toISOString()
  };

  res.json({
    success: true,
    systemStatus,
    message: 'System status retrieved successfully',
    messageAr: 'تم استرداد حالة النظام بنجاح'
  });
});

module.exports = router;