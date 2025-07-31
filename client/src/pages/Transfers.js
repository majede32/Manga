import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import TunisianFlag from '../components/TunisianFlag';
import CarthageEagle from '../components/CarthageEagle';
import { 
  FaExchangeAlt, 
  FaUser, 
  FaCreditCard, 
  FaShieldAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHistory
} from 'react-icons/fa';

const Transfers = () => {
  const { t } = useTranslation();
  const [transferData, setTransferData] = useState({
    fromAccount: '',
    toAccount: '',
    amount: '',
    description: '',
    transferType: 'internal'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // محاكاة التحويل
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(true);
      setTransferData({
        fromAccount: '',
        toAccount: '',
        amount: '',
        description: '',
        transferType: 'internal'
      });
    } catch (err) {
      setError(t('transferError'));
    } finally {
      setLoading(false);
    }
  };

  const transferTypes = [
    {
      id: 'internal',
      name: 'تحويل داخلي',
      description: 'تحويل بين حساباتك',
      icon: FaUser,
      color: 'text-blue-600'
    },
    {
      id: 'external',
      name: 'تحويل خارجي',
      description: 'تحويل إلى حساب آخر',
      icon: FaCreditCard,
      color: 'text-green-600'
    },
    {
      id: 'international',
      name: 'تحويل دولي',
      description: 'تحويل إلى الخارج',
      icon: FaExchangeAlt,
      color: 'text-red-600'
    }
  ];

  const recentTransfers = [
    {
      id: 1,
      type: 'internal',
      amount: 500,
      from: 'حساب جاري',
      to: 'حساب ادخار',
      date: '2024-01-15',
      status: 'completed'
    },
    {
      id: 2,
      type: 'external',
      amount: 1000,
      from: 'حساب جاري',
      to: 'أحمد محمد',
      date: '2024-01-14',
      status: 'pending'
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('transfer')}</h1>
          <p className="text-gray-600">{t('transferDescription')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* نموذج التحويل */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FaExchangeAlt className="text-red-600 ml-2" />
                {t('transferMoney')}
              </h2>

              {/* أنواع التحويل */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {transferTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      transferData.transferType === type.id
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                    onClick={() => setTransferData({...transferData, transferType: type.id})}
                  >
                    <div className="flex items-center mb-2">
                      <type.icon className={`text-xl ml-2 ${type.color}`} />
                      <h3 className="font-semibold text-gray-800">{type.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                ))}
              </div>

              {/* رسائل النجاح والخطأ */}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                  <FaCheckCircle className="text-green-500 ml-2" />
                  {t('transferSuccess')}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                  <FaTimesCircle className="text-red-500 ml-2" />
                  {error}
                </div>
              )}

              {/* نموذج التحويل */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      {t('fromAccount')}
                    </label>
                    <select
                      value={transferData.fromAccount}
                      onChange={(e) => setTransferData({...transferData, fromAccount: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      required
                    >
                      <option value="">{t('selectAccount')}</option>
                      <option value="current">حساب جاري - 1000 {t('currency')}</option>
                      <option value="savings">حساب ادخار - 5000 {t('currency')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      {t('toAccount')}
                    </label>
                    <input
                      type="text"
                      value={transferData.toAccount}
                      onChange={(e) => setTransferData({...transferData, toAccount: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      placeholder={transferData.transferType === 'internal' ? 'اختر الحساب' : 'رقم الحساب أو الاسم'}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    {t('transferAmount')} ({t('currency')})
                  </label>
                  <input
                    type="number"
                    value={transferData.amount}
                    onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    {t('transferDescription')}
                  </label>
                  <textarea
                    value={transferData.description}
                    onChange={(e) => setTransferData({...transferData, description: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    rows="3"
                    placeholder={t('transferDescriptionPlaceholder')}
                  />
                </div>

                <div className="flex items-center space-x-4 space-x-reverse">
                  <FaShieldAlt className="text-green-600" />
                  <span className="text-sm text-gray-600">{t('secureTransfer')}</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                      {t('processing')}
                    </div>
                  ) : (
                    t('confirmTransfer')
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* التحويلات الأخيرة */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FaHistory className="text-red-600 ml-2" />
                {t('recentTransfers')}
              </h3>

              <div className="space-y-4">
                {recentTransfers.map((transfer) => (
                  <div key={transfer.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{transfer.date}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        transfer.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transfer.status === 'completed' ? t('completed') : t('pending')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{transfer.amount} {t('currency')}</p>
                        <p className="text-sm text-gray-600">{transfer.from} → {transfer.to}</p>
                      </div>
                      <FaExchangeAlt className="text-red-600" />
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 text-red-600 hover:text-red-800 transition-colors text-sm">
                {t('viewAllTransfers')}
              </button>
            </div>
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{t('transferInfo')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3 space-x-reverse">
              <FaShieldAlt className="text-green-600 text-xl" />
              <div>
                <h4 className="font-semibold text-gray-800">{t('secure')}</h4>
                <p className="text-sm text-gray-600">{t('secureDescription')}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 space-x-reverse">
              <FaClock className="text-blue-600 text-xl" />
              <div>
                <h4 className="font-semibold text-gray-800">{t('fast')}</h4>
                <p className="text-sm text-gray-600">{t('fastDescription')}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 space-x-reverse">
              <FaCheckCircle className="text-green-600 text-xl" />
              <div>
                <h4 className="font-semibold text-gray-800">{t('reliable')}</h4>
                <p className="text-sm text-gray-600">{t('reliableDescription')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transfers;