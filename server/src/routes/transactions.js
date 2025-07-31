const express = require('express');
const router = express.Router();

// Mock transactions data
const mockTransactions = [
  {
    id: '1',
    type: 'transfer',
    amount: 250.00,
    currency: 'TND',
    status: 'completed',
    description: 'تحويل إلى حساب آخر',
    fromAccountNumber: 'TN2000100001234567890123',
    toAccountNumber: 'TN2000100001234567890124',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    type: 'deposit',
    amount: 1000.00,
    currency: 'TND',
    status: 'completed',
    description: 'إيداع نقدي',
    toAccountNumber: 'TN2000100001234567890123',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// GET /api/transactions
router.get('/', (req, res) => {
  res.json({
    success: true,
    transactions: mockTransactions,
    message: 'Transactions retrieved successfully',
    messageAr: 'تم استرداد المعاملات بنجاح'
  });
});

// GET /api/transactions/:id
router.get('/:id', (req, res) => {
  const transaction = mockTransactions.find(t => t.id === req.params.id);
  if (!transaction) {
    return res.status(404).json({
      success: false,
      error: 'Transaction not found',
      errorAr: 'المعاملة غير موجودة'
    });
  }
  res.json({
    success: true,
    transaction,
    message: 'Transaction retrieved successfully',
    messageAr: 'تم استرداد المعاملة بنجاح'
  });
});

module.exports = router;