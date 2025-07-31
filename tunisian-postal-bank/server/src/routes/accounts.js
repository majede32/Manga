const express = require('express');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const logger = require('../utils/logger');

const router = express.Router();

// Mock accounts data
const mockAccounts = new Map();

// Initialize some mock accounts
const initializeMockData = () => {
  const account1 = {
    id: crypto.randomUUID(),
    accountNumber: 'TN2000100001234567890123',
    type: 'current',
    balance: 5420.75,
    currency: 'TND',
    isActive: true,
    createdAt: new Date().toISOString(),
    accountName: 'حساب جاري رئيسي',
    minimumBalance: 0,
    userId: 'mock-user-1'
  };

  const account2 = {
    id: crypto.randomUUID(),
    accountNumber: 'TN2000100001234567890124',
    type: 'savings',
    balance: 12500.50,
    currency: 'TND',
    isActive: true,
    createdAt: new Date().toISOString(),
    accountName: 'حساب ادخار',
    minimumBalance: 100,
    interestRate: 3.5,
    userId: 'mock-user-1'
  };

  mockAccounts.set(account1.id, account1);
  mockAccounts.set(account2.id, account2);
};

initializeMockData();

// GET /api/accounts - Get user accounts
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id || 'mock-user-1';
    
    const userAccounts = Array.from(mockAccounts.values())
      .filter(account => account.userId === userId);

    const totalBalance = userAccounts.reduce((sum, account) => sum + account.balance, 0);

    logger.auditLog('ACCOUNTS_VIEWED', userId, { accountCount: userAccounts.length });

    res.status(200).json({
      success: true,
      accounts: userAccounts,
      totalBalance,
      currency: 'TND',
      message: 'Accounts retrieved successfully',
      messageAr: 'تم استرداد الحسابات بنجاح'
    });

  } catch (error) {
    logger.error('Get accounts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve accounts',
      errorAr: 'فشل في استرداد الحسابات'
    });
  }
});

// GET /api/accounts/:id - Get specific account
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'mock-user-1';
    
    const account = mockAccounts.get(id);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found',
        errorAr: 'الحساب غير موجود'
      });
    }

    if (account.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        errorAr: 'تم رفض الوصول'
      });
    }

    logger.auditLog('ACCOUNT_VIEWED', userId, { accountId: id, accountNumber: account.accountNumber });

    res.status(200).json({
      success: true,
      account,
      message: 'Account retrieved successfully',
      messageAr: 'تم استرداد الحساب بنجاح'
    });

  } catch (error) {
    logger.error('Get account error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve account',
      errorAr: 'فشل في استرداد الحساب'
    });
  }
});

// POST /api/accounts - Create new account
router.post('/', [
  body('type').isIn(['current', 'savings', 'business']),
  body('accountName').isLength({ min: 2, max: 100 }).trim(),
  body('initialDeposit').optional().isFloat({ min: 0 })
], async (req, res) => {
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

    const { type, accountName, initialDeposit = 0 } = req.body;
    const userId = req.user?.id || 'mock-user-1';

    // Generate unique account number
    const accountNumber = `TN200010000${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const newAccount = {
      id: crypto.randomUUID(),
      accountNumber,
      type,
      balance: initialDeposit,
      currency: 'TND',
      isActive: true,
      createdAt: new Date().toISOString(),
      accountName,
      minimumBalance: type === 'savings' ? 100 : 0,
      interestRate: type === 'savings' ? 3.5 : undefined,
      userId
    };

    mockAccounts.set(newAccount.id, newAccount);

    logger.auditLog('ACCOUNT_CREATED', userId, { 
      accountId: newAccount.id, 
      accountNumber: newAccount.accountNumber,
      type,
      initialDeposit
    });

    res.status(201).json({
      success: true,
      account: newAccount,
      message: 'Account created successfully',
      messageAr: 'تم إنشاء الحساب بنجاح'
    });

  } catch (error) {
    logger.error('Create account error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create account',
      errorAr: 'فشل في إنشاء الحساب'
    });
  }
});

// GET /api/accounts/:id/balance - Get account balance
router.get('/:id/balance', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'mock-user-1';
    
    const account = mockAccounts.get(id);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found',
        errorAr: 'الحساب غير موجود'
      });
    }

    if (account.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        errorAr: 'تم رفض الوصول'
      });
    }

    logger.auditLog('BALANCE_CHECKED', userId, { 
      accountId: id, 
      accountNumber: account.accountNumber,
      balance: account.balance
    });

    res.status(200).json({
      success: true,
      balance: account.balance,
      currency: account.currency,
      accountNumber: account.accountNumber,
      lastUpdated: new Date().toISOString(),
      message: 'Balance retrieved successfully',
      messageAr: 'تم استرداد الرصيد بنجاح'
    });

  } catch (error) {
    logger.error('Get balance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve balance',
      errorAr: 'فشل في استرداد الرصيد'
    });
  }
});

// PUT /api/accounts/:id - Update account
router.put('/:id', [
  body('accountName').optional().isLength({ min: 2, max: 100 }).trim()
], async (req, res) => {
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

    const { id } = req.params;
    const { accountName } = req.body;
    const userId = req.user?.id || 'mock-user-1';
    
    const account = mockAccounts.get(id);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found',
        errorAr: 'الحساب غير موجود'
      });
    }

    if (account.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        errorAr: 'تم رفض الوصول'
      });
    }

    // Update account
    if (accountName) account.accountName = accountName;
    account.updatedAt = new Date().toISOString();

    mockAccounts.set(id, account);

    logger.auditLog('ACCOUNT_UPDATED', userId, { 
      accountId: id, 
      accountNumber: account.accountNumber,
      changes: { accountName }
    });

    res.status(200).json({
      success: true,
      account,
      message: 'Account updated successfully',
      messageAr: 'تم تحديث الحساب بنجاح'
    });

  } catch (error) {
    logger.error('Update account error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update account',
      errorAr: 'فشل في تحديث الحساب'
    });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Accounts service is healthy',
    messageAr: 'خدمة الحسابات تعمل بشكل سليم',
    timestamp: new Date().toISOString(),
    accountsCount: mockAccounts.size
  });
});

module.exports = router;