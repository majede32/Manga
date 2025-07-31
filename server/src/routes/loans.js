const express = require('express');
const router = express.Router();

// Mock loans data
const mockLoans = [
  {
    id: '1',
    type: 'personal',
    amount: 15000,
    approvedAmount: 15000,
    currency: 'TND',
    interestRate: 8.5,
    termMonths: 36,
    monthlyPayment: 474.21,
    status: 'active',
    purpose: 'تمويل شخصي',
    applicationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    approvalDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    remainingBalance: 12450.50,
    paidAmount: 2549.50
  }
];

// GET /api/loans
router.get('/', (req, res) => {
  res.json({
    success: true,
    loans: mockLoans,
    message: 'Loans retrieved successfully',
    messageAr: 'تم استرداد القروض بنجاح'
  });
});

// GET /api/loans/types
router.get('/types', (req, res) => {
  const loanTypes = [
    {
      type: 'personal',
      name: 'قرض شخصي',
      nameEn: 'Personal Loan',
      minAmount: 1000,
      maxAmount: 50000,
      minTerm: 12,
      maxTerm: 60,
      interestRate: 8.5,
      requirements: ['راتب ثابت', 'ضمان شخصي']
    },
    {
      type: 'business',
      name: 'قرض تجاري',
      nameEn: 'Business Loan',
      minAmount: 5000,
      maxAmount: 200000,
      minTerm: 24,
      maxTerm: 120,
      interestRate: 7.5,
      requirements: ['سجل تجاري', 'كشف حساب بنكي']
    },
    {
      type: 'housing',
      name: 'قرض إسكان',
      nameEn: 'Housing Loan',
      minAmount: 10000,
      maxAmount: 500000,
      minTerm: 60,
      maxTerm: 300,
      interestRate: 6.5,
      requirements: ['عقد ملكية', 'تأمين على العقار']
    }
  ];

  res.json({
    success: true,
    loanTypes,
    message: 'Loan types retrieved successfully',
    messageAr: 'تم استرداد أنواع القروض بنجاح'
  });
});

module.exports = router;