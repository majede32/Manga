import React from 'react';
import { useTranslation } from 'react-i18next';
import TunisianFlag from './TunisianFlag';
import CarthageEagle from './CarthageEagle';
import { FaUser, FaSignOutAlt, FaGlobe } from 'react-icons/fa';

const Header = ({ user, onLogout, onLanguageChange }) => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    if (onLanguageChange) onLanguageChange(lng);
  };

  return (
    <header className="bg-white shadow-lg border-b-4 border-red-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* الشعار والعلم */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="flex items-center space-x-2 space-x-reverse">
              <TunisianFlag size="medium" animated={true} />
              <CarthageEagle size="medium" animated={true} />
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-red-600">البنك البريدي التونسي</h1>
              <p className="text-sm text-gray-600">Banque Postale Tunisienne</p>
            </div>
          </div>

          {/* القائمة اليمنى */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* اختيار اللغة */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <FaGlobe className="text-gray-600" />
              <select
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="ar">العربية</option>
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* معلومات المستخدم */}
            {user && (
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <FaUser className="text-gray-600" />
                  <button
                    onClick={onLogout}
                    className="flex items-center space-x-1 space-x-reverse text-red-600 hover:text-red-800 transition-colors"
                  >
                    <FaSignOutAlt />
                    <span className="text-sm">{t('logout')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;