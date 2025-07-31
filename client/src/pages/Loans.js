import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import TunisianFlag from '../components/TunisianFlag';
import CarthageEagle from '../components/CarthageEagle';
import { 
  FaHandHoldingUsd, 
  FaCalculator, 
  FaFileAlt, 
  FaCheckCircle,
  FaClock,
  FaPercent,
  FaMoneyBillWave
} from 'react-icons/fa';

const Loans = () => {
  const { t } = useTranslation();
  const [loanAmount, setLoanAmount] = useState('');
  const [loanDuration, setLoanDuration] = useState(12);
  const [interestRate, setInterestRate] = useState(8.5);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [showCalculator, setShowCalculator] = useState(false);

  // حساب القرض
  const calculateLoan = () => {
    const principal = parseFloat(loanAmount);
    const rate = interestRate / 100 / 12;
    const time = loanDuration;
    
    if (principal > 0 && rate > 0 && time > 0) {
      const monthly = (principal * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1);
      const total = monthly * time;
      const interest = total - principal;
      
      setMonthlyPayment(monthly);
      setTotalPayment(total);
      setTotalInterest(interest);
    }
  };

  // حساب القرض عند تغيير القيم
  React.useEffect(() => {
    if (loanAmount && loanDuration && interestRate) {
      calculateLoan();
    }
  }, [loanAmount, loanDuration, interestRate]);

  const loanTypes = [
    {
      id: 1,
      name: 'قرض شخصي',
      description: 'للمشاريع الشخصية والاحتياجات اليومية',
      minAmount: 1000,
      maxAmount: 50000,
      rate: 8.5,
      duration: '12-60 شهر'
    },
    {
      id: 2,
      name: 'قرض عقاري',
      description: 'لشراء أو بناء منزل',
      minAmount: 50000,
      maxAmount: 500000,
      rate: 6.5,
      duration: '60-300 شهر'
    },
    {
      id: 3,
      name: 'قرض تجاري',
      description: 'للمشاريع التجارية والاستثمارية',
      minAmount: 10000,
      maxAmount: 200000,
      rate: 9.5,
      duration: '24-120 شهر'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* العنوان */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center space-x-4 space-x-reverse mb-4">
            <TunisianFlag size="large" animated={true} />
            <CarthageEagle size="large" animated={true} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('loans')}</h1>
          <p className="text-gray-600">{t('loanDescription')}</p>
        </div>

        {/* أنواع القروض */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {loanTypes.map((loan) => (
            <div key={loan.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <FaHandHoldingUsd className="text-red-600 text-2xl ml-3" />
                <h3 className="text-lg font-semibold text-gray-800">{loan.name}</h3>
              </div>
              
              <p className="text-gray-600 mb-4">{loan.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{t('minAmount')}:</span>
                  <span className="font-semibold">{loan.minAmount} {t('currency')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{t('maxAmount')}:</span>
                  <span className="font-semibold">{loan.maxAmount} {t('currency')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{t('interestRate')}:</span>
                  <span className="font-semibold text-red-600">{loan.rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{t('duration')}:</span>
                  <span className="font-semibold">{loan.duration}</span>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setInterestRate(loan.rate);
                  setShowCalculator(true);
                }}
                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                {t('applyNow')}
              </button>
            </div>
          ))}
        </div>

        {/* حاسبة القروض */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaCalculator className="text-red-600 ml-2" />
              {t('loanCalculator')}
            </h2>
            <button 
              onClick={() => setShowCalculator(!showCalculator)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {showCalculator ? t('hide') : t('show')}
            </button>
          </div>

          {showCalculator && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* إدخال البيانات */}
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    {t('loanAmount')} ({t('currency')})
                  </label>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="10000"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    {t('loanDuration')} ({t('months')})
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="60"
                    value={loanDuration}
                    onChange={(e) => setLoanDuration(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>12</span>
                    <span>{loanDuration}</span>
                    <span>60</span>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    {t('interestRate')} (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="8.5"
                  />
                </div>
              </div>

              {/* النتائج */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('calculationResults')}</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('monthlyPayment')}:</span>
                    <span className="text-xl font-bold text-green-600">
                      {monthlyPayment.toFixed(2)} {t('currency')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('totalPayment')}:</span>
                    <span className="text-lg font-semibold text-gray-800">
                      {totalPayment.toFixed(2)} {t('currency')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('totalInterest')}:</span>
                    <span className="text-lg font-semibold text-red-600">
                      {totalInterest.toFixed(2)} {t('currency')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('loanDuration')}:</span>
                    <span className="text-lg font-semibold text-gray-800">
                      {loanDuration} {t('months')}
                    </span>
                  </div>
                </div>

                <button className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors mt-6">
                  {t('applyForLoan')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* خطوات التقديم */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FaFileAlt className="text-red-600 ml-2" />
            {t('applicationSteps')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                1
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{t('step1')}</h3>
              <p className="text-sm text-gray-600">{t('step1Description')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                2
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{t('step2')}</h3>
              <p className="text-sm text-gray-600">{t('step2Description')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                3
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{t('step3')}</h3>
              <p className="text-sm text-gray-600">{t('step3Description')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                4
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{t('step4')}</h3>
              <p className="text-sm text-gray-600">{t('step4Description')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loans;