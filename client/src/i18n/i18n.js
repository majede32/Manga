import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    ar: {
      translation: {
        // الترحيب والعنوان
        welcome: 'مرحبًا بكم في البنك البريدي التونسي',
        postalBank: 'البنك البريدي التونسي',
        banquePostale: 'Banque Postale Tunisienne',
        
        // تسجيل الدخول
        login: 'تسجيل الدخول',
        username: 'اسم المستخدم',
        password: 'كلمة المرور',
        loginError: 'فشل تسجيل الدخول، تحقق من بياناتك',
        loginSuccess: 'تم تسجيل الدخول بنجاح',
        
        // لوحة التحكم
        dashboard: 'لوحة التحكم',
        accounts: 'الحسابات',
        balance: 'الرصيد',
        accountNumber: 'رقم الحساب',
        accountType: 'نوع الحساب',
        currentAccount: 'حساب جاري',
        savingsAccount: 'حساب ادخار',
        
        // التحويلات
        transfer: 'تحويل',
        transferMoney: 'تحويل الأموال',
        transferTo: 'تحويل إلى',
        transferAmount: 'مبلغ التحويل',
        transferDescription: 'وصف التحويل',
        transferSuccess: 'تم التحويل بنجاح',
        transferError: 'فشل في التحويل',
        
        // القروض
        loans: 'القروض',
        loanApplication: 'طلب قرض',
        loanAmount: 'مبلغ القرض',
        loanDuration: 'مدة القرض',
        loanPurpose: 'غرض القرض',
        loanCalculator: 'حاسبة القروض',
        monthlyPayment: 'القسط الشهري',
        interestRate: 'معدل الفائدة',
        
        // الملف الشخصي
        profile: 'الملف الشخصي',
        personalInfo: 'المعلومات الشخصية',
        contactInfo: 'معلومات الاتصال',
        changePassword: 'تغيير كلمة المرور',
        updateProfile: 'تحديث الملف الشخصي',
        
        // عام
        logout: 'تسجيل الخروج',
        error: 'خطأ',
        success: 'نجح',
        loading: 'جاري التحميل...',
        save: 'حفظ',
        cancel: 'إلغاء',
        confirm: 'تأكيد',
        delete: 'حذف',
        edit: 'تعديل',
        add: 'إضافة',
        search: 'بحث',
        filter: 'تصفية',
        sort: 'ترتيب',
        
        // العملة
        currency: 'د.ت',
        dinar: 'دينار تونسي',
        
        // العلم والرموز
        tunisia: 'تونس',
        carthage: 'قرطاج',
        eagle: 'نسر قرطاج',
        flag: 'العلم التونسي',
        
        // رسائل
        welcomeMessage: 'مرحبًا بكم في البنك البريدي التونسي 🇹🇳',
        secureBanking: 'خدمات مصرفية آمنة ومتطورة',
        trustedBank: 'بنك موثوق به منذ عقود',
      },
    },
    fr: {
      translation: {
        // Accueil et titre
        welcome: 'Bienvenue à la Banque Postale Tunisienne',
        postalBank: 'Banque Postale Tunisienne',
        banquePostale: 'Banque Postale Tunisienne',
        
        // Connexion
        login: 'Se connecter',
        username: 'Nom d\'utilisateur',
        password: 'Mot de passe',
        loginError: 'Échec de la connexion, vérifiez vos informations',
        loginSuccess: 'Connexion réussie',
        
        // Tableau de bord
        dashboard: 'Tableau de bord',
        accounts: 'Comptes',
        balance: 'Solde',
        accountNumber: 'Numéro de compte',
        accountType: 'Type de compte',
        currentAccount: 'Compte courant',
        savingsAccount: 'Compte d\'épargne',
        
        // Transferts
        transfer: 'Transfert',
        transferMoney: 'Transférer de l\'argent',
        transferTo: 'Transférer vers',
        transferAmount: 'Montant du transfert',
        transferDescription: 'Description du transfert',
        transferSuccess: 'Transfert réussi',
        transferError: 'Échec du transfert',
        
        // Prêts
        loans: 'Prêts',
        loanApplication: 'Demande de prêt',
        loanAmount: 'Montant du prêt',
        loanDuration: 'Durée du prêt',
        loanPurpose: 'Objet du prêt',
        loanCalculator: 'Calculateur de prêt',
        monthlyPayment: 'Paiement mensuel',
        interestRate: 'Taux d\'intérêt',
        
        // Profil
        profile: 'Profil',
        personalInfo: 'Informations personnelles',
        contactInfo: 'Informations de contact',
        changePassword: 'Changer le mot de passe',
        updateProfile: 'Mettre à jour le profil',
        
        // Général
        logout: 'Se déconnecter',
        error: 'Erreur',
        success: 'Succès',
        loading: 'Chargement...',
        save: 'Enregistrer',
        cancel: 'Annuler',
        confirm: 'Confirmer',
        delete: 'Supprimer',
        edit: 'Modifier',
        add: 'Ajouter',
        search: 'Rechercher',
        filter: 'Filtrer',
        sort: 'Trier',
        
        // Devise
        currency: 'DT',
        dinar: 'Dinar tunisien',
        
        // Drapeau et symboles
        tunisia: 'Tunisie',
        carthage: 'Carthage',
        eagle: 'Aigle de Carthage',
        flag: 'Drapeau tunisien',
        
        // Messages
        welcomeMessage: 'Bienvenue à la Banque Postale Tunisienne 🇹🇳',
        secureBanking: 'Services bancaires sécurisés et avancés',
        trustedBank: 'Banque de confiance depuis des décennies',
      },
    },
    en: {
      translation: {
        // Welcome and title
        welcome: 'Welcome to the Tunisian Postal Bank',
        postalBank: 'Tunisian Postal Bank',
        banquePostale: 'Banque Postale Tunisienne',
        
        // Login
        login: 'Login',
        username: 'Username',
        password: 'Password',
        loginError: 'Login failed, check your credentials',
        loginSuccess: 'Login successful',
        
        // Dashboard
        dashboard: 'Dashboard',
        accounts: 'Accounts',
        balance: 'Balance',
        accountNumber: 'Account Number',
        accountType: 'Account Type',
        currentAccount: 'Current Account',
        savingsAccount: 'Savings Account',
        
        // Transfers
        transfer: 'Transfer',
        transferMoney: 'Transfer Money',
        transferTo: 'Transfer to',
        transferAmount: 'Transfer Amount',
        transferDescription: 'Transfer Description',
        transferSuccess: 'Transfer successful',
        transferError: 'Transfer failed',
        
        // Loans
        loans: 'Loans',
        loanApplication: 'Loan Application',
        loanAmount: 'Loan Amount',
        loanDuration: 'Loan Duration',
        loanPurpose: 'Loan Purpose',
        loanCalculator: 'Loan Calculator',
        monthlyPayment: 'Monthly Payment',
        interestRate: 'Interest Rate',
        
        // Profile
        profile: 'Profile',
        personalInfo: 'Personal Information',
        contactInfo: 'Contact Information',
        changePassword: 'Change Password',
        updateProfile: 'Update Profile',
        
        // General
        logout: 'Logout',
        error: 'Error',
        success: 'Success',
        loading: 'Loading...',
        save: 'Save',
        cancel: 'Cancel',
        confirm: 'Confirm',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort',
        
        // Currency
        currency: 'TND',
        dinar: 'Tunisian Dinar',
        
        // Flag and symbols
        tunisia: 'Tunisia',
        carthage: 'Carthage',
        eagle: 'Carthage Eagle',
        flag: 'Tunisian Flag',
        
        // Messages
        welcomeMessage: 'Welcome to the Tunisian Postal Bank 🇹🇳',
        secureBanking: 'Secure and advanced banking services',
        trustedBank: 'Trusted bank for decades',
      },
    },
  },
  lng: 'ar',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;