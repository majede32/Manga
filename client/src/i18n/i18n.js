import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    ar: {
      translation: {
        welcome: 'مرحبًا بكم في البنك البريدي',
        login: 'تسجيل الدخول',
        username: 'اسم المستخدم',
        password: 'كلمة المرور',
        dashboard: 'لوحة التحكم',
        accounts: 'الحسابات',
        balance: 'الرصيد',
        transfer: 'تحويل',
        loans: 'القروض',
        profile: 'الملف الشخصي',
        logout: 'تسجيل الخروج',
        error: 'خطأ',
        success: 'نجح',
        loading: 'جاري التحميل...',
      },
    },
    fr: {
      translation: {
        welcome: 'Bienvenue à la Banque Postale',
        login: 'Se connecter',
        username: 'Nom d\'utilisateur',
        password: 'Mot de passe',
        dashboard: 'Tableau de bord',
        accounts: 'Comptes',
        balance: 'Solde',
        transfer: 'Transfert',
        loans: 'Prêts',
        profile: 'Profil',
        logout: 'Se déconnecter',
        error: 'Erreur',
        success: 'Succès',
        loading: 'Chargement...',
      },
    },
    en: {
      translation: {
        welcome: 'Welcome to the Postal Bank',
        login: 'Login',
        username: 'Username',
        password: 'Password',
        dashboard: 'Dashboard',
        accounts: 'Accounts',
        balance: 'Balance',
        transfer: 'Transfer',
        loans: 'Loans',
        profile: 'Profile',
        logout: 'Logout',
        error: 'Error',
        success: 'Success',
        loading: 'Loading...',
      },
    },
  },
  lng: 'ar',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;