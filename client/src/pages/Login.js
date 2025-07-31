import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import TunisianFlag from '../components/TunisianFlag';
import CarthageEagle from '../components/CarthageEagle';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password,
      });
      localStorage.setItem('token', response.data.token);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(t('loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-red-100">
        {/* الشعار والعلم */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center space-x-4 space-x-reverse mb-4">
            <TunisianFlag size="large" animated={true} />
            <CarthageEagle size="large" animated={true} />
          </div>
          <h2 className="text-3xl font-bold text-red-600 mb-2">{t('postalBank')}</h2>
          <p className="text-gray-600 text-sm">{t('banquePostale')}</p>
          <div className="mt-2">
            <span className="text-2xl">🇹🇳</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* اسم المستخدم */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center">
              <FaUser className="ml-2 text-red-600" />
              {t('username')}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
              placeholder={t('username')}
              required
            />
          </div>
          
          {/* كلمة المرور */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center">
              <FaLock className="ml-2 text-red-600" />
              {t('password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                placeholder={t('password')}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-600 transition-colors"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          {/* رسالة الخطأ */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <span className="text-red-500 mr-2">⚠</span>
              {error}
            </div>
          )}
          
          {/* زر تسجيل الدخول */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white p-3 rounded-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {t('loading')}
              </div>
            ) : (
              t('login')
            )}
          </button>
        </form>

        {/* معلومات إضافية */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            {t('secureBanking')}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {t('trustedBank')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;