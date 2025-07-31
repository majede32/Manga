import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Header from '../components/Header';
import TunisianFlag from '../components/TunisianFlag';
import CarthageEagle from '../components/CarthageEagle';
import { 
  FaWallet, 
  FaExchangeAlt, 
  FaHandHoldingUsd, 
  FaUser, 
  FaChartLine,
  FaCreditCard,
  FaShieldAlt,
  FaBell
} from 'react-icons/fa';

const Dashboard = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalAccounts: 0,
    recentTransactions: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const fetchData = async () => {
      try {
        const [userResponse, accountsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/accounts', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUser(userResponse.data);
        setAccounts(accountsResponse.data);
        
        // حساب الإحصائيات
        const totalBalance = accountsResponse.data.reduce((sum, account) => sum + account.balance, 0);
        setStats({
          totalBalance,
          totalAccounts: accountsResponse.data.length,
          recentTransactions: Math.floor(Math.random() * 10) + 1 // محاكاة
        });
      } catch (err) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="flex justify-center items-center space-x-4 space-x-reverse mb-4">
            <TunisianFlag size="large" animated={true} />
            <CarthageEagle size="large" animated={true} />
          </div>
          <div className="text-xl text-gray-600">{t('loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* الترحيب */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('welcome')}، {user?.name} 🇹🇳
          </h1>
          <p className="text-gray-600">{t('secureBanking')}</p>
        </div>

        {/* الإحصائيات السريعة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-600">
            <div className="flex items-center">
              <FaWallet className="text-red-600 text-2xl ml-3" />
              <div>
                <p className="text-sm text-gray-600">{t('totalBalance')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBalance} {t('currency')}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-600">
            <div className="flex items-center">
              <FaCreditCard className="text-green-600 text-2xl ml-3" />
              <div>
                <p className="text-sm text-gray-600">{t('accounts')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAccounts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-600">
            <div className="flex items-center">
              <FaChartLine className="text-blue-600 text-2xl ml-3" />
              <div>
                <p className="text-sm text-gray-600">{t('recentTransactions')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentTransactions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* الحسابات */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaWallet className="text-red-600 ml-2" />
              {t('accounts')}
            </h2>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
              {t('add')} {t('accounts')}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <div key={account.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className={`w-3 h-3 rounded-full ${account.type === 'جاري' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                    <h3 className="text-lg font-semibold text-gray-800">{t(account.type === 'جاري' ? 'currentAccount' : 'savingsAccount')}</h3>
                  </div>
                  <FaShieldAlt className="text-green-600" />
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600">{t('accountNumber')}</p>
                  <p className="font-mono text-gray-800">{account.accountNumber}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600">{t('balance')}</p>
                  <p className="text-2xl font-bold text-green-600">{account.balance} {t('currency')}</p>
                </div>
                
                <div className="flex space-x-2 space-x-reverse">
                  <button className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors text-sm">
                    {t('transfer')}
                  </button>
                  <button className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                    {t('details')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {accounts.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <FaWallet className="text-gray-400 text-4xl mx-auto mb-4" />
              <p className="text-gray-600">{t('noAccounts')}</p>
              <button className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
                {t('createAccount')}
              </button>
            </div>
          )}
        </div>

        {/* الخدمات السريعة */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('quickServices')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow cursor-pointer">
              <FaExchangeAlt className="text-red-600 text-3xl mx-auto mb-3" />
              <p className="font-semibold text-gray-800">{t('transfer')}</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow cursor-pointer">
              <FaHandHoldingUsd className="text-green-600 text-3xl mx-auto mb-3" />
              <p className="font-semibold text-gray-800">{t('loans')}</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow cursor-pointer">
              <FaUser className="text-blue-600 text-3xl mx-auto mb-3" />
              <p className="font-semibold text-gray-800">{t('profile')}</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow cursor-pointer">
              <FaBell className="text-yellow-600 text-3xl mx-auto mb-3" />
              <p className="font-semibold text-gray-800">{t('notifications')}</p>
            </div>
          </div>
        </div>

        {/* العلم التونسي في الأسفل */}
        <div className="text-center py-8">
          <div className="flex justify-center items-center space-x-4 space-x-reverse mb-4">
            <TunisianFlag size="large" animated={true} />
            <CarthageEagle size="large" animated={true} />
          </div>
          <p className="text-gray-600 text-sm">{t('trustedBank')}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;