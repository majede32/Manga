import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  ar: {
    translation: {
      // Navigation
      dashboard: 'لوحة التحكم',
      accounts: 'الحسابات',
      transfers: 'التحويلات',
      loans: 'القروض',
      services: 'الخدمات',
      support: 'الدعم',
      profile: 'الملف الشخصي',
      logout: 'تسجيل الخروج',
      
      // Common
      welcome: 'مرحباً',
      loading: 'جارٍ التحميل...',
      save: 'حفظ',
      cancel: 'إلغاء',
      submit: 'إرسال',
      delete: 'حذف',
      edit: 'تعديل',
      view: 'عرض',
      download: 'تحميل',
      print: 'طباعة',
      search: 'بحث',
      filter: 'فلترة',
      refresh: 'تحديث',
      back: 'رجوع',
      next: 'التالي',
      previous: 'السابق',
      
      // Authentication
      login: 'تسجيل الدخول',
      register: 'تسجيل حساب جديد',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      forgotPassword: 'نسيت كلمة المرور؟',
      rememberMe: 'تذكرني',
      firstName: 'الاسم الأول',
      lastName: 'اسم العائلة',
      phoneNumber: 'رقم الهاتف',
      nationalId: 'رقم الهوية الوطنية',
      dateOfBirth: 'تاريخ الميلاد',
      address: 'العنوان',
      
      // Dashboard
      totalBalance: 'الرصيد الإجمالي',
      savingsAccount: 'حساب الادخار',
      currentAccount: 'الحساب الجاري',
      recentTransactions: 'المعاملات الأخيرة',
      quickActions: 'إجراءات سريعة',
      monthlySpending: 'المصاريف الشهرية',
      
      // Transactions
      transfer: 'تحويل',
      deposit: 'إيداع',
      withdrawal: 'سحب',
      payment: 'دفع',
      amount: 'المبلغ',
      recipient: 'المستفيد',
      reference: 'المرجع',
      date: 'التاريخ',
      status: 'الحالة',
      pending: 'معلق',
      completed: 'مكتمل',
      failed: 'فشل',
      
      // Loans
      applyForLoan: 'طلب قرض',
      loanAmount: 'مبلغ القرض',
      loanTerm: 'مدة القرض',
      interestRate: 'معدل الفائدة',
      monthlyPayment: 'القسط الشهري',
      personalLoan: 'قرض شخصي',
      businessLoan: 'قرض تجاري',
      housingLoan: 'قرض إسكان',
      
      // Services
      billPayment: 'دفع الفواتير',
      mobileRecharge: 'شحن الهاتف',
      onlineShopping: 'التسوق الإلكتروني',
      exchangeRates: 'أسعار الصرف',
      nearestBranch: 'أقرب فرع',
      
      // Security
      twoFactorAuth: 'المصادقة الثنائية',
      securitySettings: 'إعدادات الأمان',
      changePassword: 'تغيير كلمة المرور',
      loginHistory: 'تاريخ تسجيل الدخول',
      
      // Messages
      loginSuccess: 'تم تسجيل الدخول بنجاح',
      loginError: 'خطأ في تسجيل الدخول',
      transferSuccess: 'تم التحويل بنجاح',
      transferError: 'فشل في التحويل',
      insufficientFunds: 'رصيد غير كافٍ',
      invalidAmount: 'مبلغ غير صحيح',
      
      // Footer
      aboutUs: 'من نحن',
      contactUs: 'اتصل بنا',
      privacyPolicy: 'سياسة الخصوصية',
      termsOfService: 'شروط الخدمة',
      faq: 'الأسئلة الشائعة',
      
      // Branding
      bankName: 'البنك البريدي التونسي',
      tagline: 'خدمات مصرفية متطورة للجميع',
    }
  },
  fr: {
    translation: {
      // Navigation
      dashboard: 'Tableau de bord',
      accounts: 'Comptes',
      transfers: 'Virements',
      loans: 'Crédits',
      services: 'Services',
      support: 'Support',
      profile: 'Profil',
      logout: 'Déconnexion',
      
      // Common
      welcome: 'Bienvenue',
      loading: 'Chargement...',
      save: 'Enregistrer',
      cancel: 'Annuler',
      submit: 'Soumettre',
      delete: 'Supprimer',
      edit: 'Modifier',
      view: 'Voir',
      download: 'Télécharger',
      print: 'Imprimer',
      search: 'Rechercher',
      filter: 'Filtrer',
      refresh: 'Actualiser',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      
      // Authentication
      login: 'Connexion',
      register: 'Créer un compte',
      email: 'Email',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      forgotPassword: 'Mot de passe oublié ?',
      rememberMe: 'Se souvenir de moi',
      firstName: 'Prénom',
      lastName: 'Nom',
      phoneNumber: 'Numéro de téléphone',
      nationalId: 'Numéro CIN',
      dateOfBirth: 'Date de naissance',
      address: 'Adresse',
      
      // Dashboard
      totalBalance: 'Solde total',
      savingsAccount: 'Compte épargne',
      currentAccount: 'Compte courant',
      recentTransactions: 'Transactions récentes',
      quickActions: 'Actions rapides',
      monthlySpending: 'Dépenses mensuelles',
      
      // Transactions
      transfer: 'Virement',
      deposit: 'Dépôt',
      withdrawal: 'Retrait',
      payment: 'Paiement',
      amount: 'Montant',
      recipient: 'Bénéficiaire',
      reference: 'Référence',
      date: 'Date',
      status: 'Statut',
      pending: 'En attente',
      completed: 'Terminé',
      failed: 'Échoué',
      
      // Loans
      applyForLoan: 'Demander un crédit',
      loanAmount: 'Montant du crédit',
      loanTerm: 'Durée du crédit',
      interestRate: 'Taux d\'intérêt',
      monthlyPayment: 'Mensualité',
      personalLoan: 'Crédit personnel',
      businessLoan: 'Crédit professionnel',
      housingLoan: 'Crédit logement',
      
      // Services
      billPayment: 'Paiement de factures',
      mobileRecharge: 'Recharge mobile',
      onlineShopping: 'Achat en ligne',
      exchangeRates: 'Taux de change',
      nearestBranch: 'Agence la plus proche',
      
      // Security
      twoFactorAuth: 'Authentification à deux facteurs',
      securitySettings: 'Paramètres de sécurité',
      changePassword: 'Changer le mot de passe',
      loginHistory: 'Historique de connexion',
      
      // Messages
      loginSuccess: 'Connexion réussie',
      loginError: 'Erreur de connexion',
      transferSuccess: 'Virement effectué avec succès',
      transferError: 'Échec du virement',
      insufficientFunds: 'Fonds insuffisants',
      invalidAmount: 'Montant invalide',
      
      // Footer
      aboutUs: 'À propos',
      contactUs: 'Nous contacter',
      privacyPolicy: 'Politique de confidentialité',
      termsOfService: 'Conditions d\'utilisation',
      faq: 'FAQ',
      
      // Branding
      bankName: 'Banque Postale Tunisienne',
      tagline: 'Services bancaires avancés pour tous',
    }
  },
  en: {
    translation: {
      // Navigation
      dashboard: 'Dashboard',
      accounts: 'Accounts',
      transfers: 'Transfers',
      loans: 'Loans',
      services: 'Services',
      support: 'Support',
      profile: 'Profile',
      logout: 'Logout',
      
      // Common
      welcome: 'Welcome',
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      submit: 'Submit',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      download: 'Download',
      print: 'Print',
      search: 'Search',
      filter: 'Filter',
      refresh: 'Refresh',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      
      // Authentication
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      rememberMe: 'Remember Me',
      firstName: 'First Name',
      lastName: 'Last Name',
      phoneNumber: 'Phone Number',
      nationalId: 'National ID',
      dateOfBirth: 'Date of Birth',
      address: 'Address',
      
      // Dashboard
      totalBalance: 'Total Balance',
      savingsAccount: 'Savings Account',
      currentAccount: 'Current Account',
      recentTransactions: 'Recent Transactions',
      quickActions: 'Quick Actions',
      monthlySpending: 'Monthly Spending',
      
      // Transactions
      transfer: 'Transfer',
      deposit: 'Deposit',
      withdrawal: 'Withdrawal',
      payment: 'Payment',
      amount: 'Amount',
      recipient: 'Recipient',
      reference: 'Reference',
      date: 'Date',
      status: 'Status',
      pending: 'Pending',
      completed: 'Completed',
      failed: 'Failed',
      
      // Loans
      applyForLoan: 'Apply for Loan',
      loanAmount: 'Loan Amount',
      loanTerm: 'Loan Term',
      interestRate: 'Interest Rate',
      monthlyPayment: 'Monthly Payment',
      personalLoan: 'Personal Loan',
      businessLoan: 'Business Loan',
      housingLoan: 'Housing Loan',
      
      // Services
      billPayment: 'Bill Payment',
      mobileRecharge: 'Mobile Recharge',
      onlineShopping: 'Online Shopping',
      exchangeRates: 'Exchange Rates',
      nearestBranch: 'Nearest Branch',
      
      // Security
      twoFactorAuth: 'Two-Factor Authentication',
      securitySettings: 'Security Settings',
      changePassword: 'Change Password',
      loginHistory: 'Login History',
      
      // Messages
      loginSuccess: 'Login successful',
      loginError: 'Login error',
      transferSuccess: 'Transfer completed successfully',
      transferError: 'Transfer failed',
      insufficientFunds: 'Insufficient funds',
      invalidAmount: 'Invalid amount',
      
      // Footer
      aboutUs: 'About Us',
      contactUs: 'Contact Us',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      faq: 'FAQ',
      
      // Branding
      bankName: 'Tunisian Postal Bank',
      tagline: 'Advanced banking services for everyone',
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;