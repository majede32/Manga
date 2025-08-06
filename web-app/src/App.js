import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

const pages = [
  { key: 'login', label: 'login' },
  { key: 'register', label: 'register' },
  { key: 'dashboard', label: 'dashboard' },
  { key: 'transactions', label: 'transactions' },
  { key: 'settings', label: 'settings' },
  { key: 'support', label: 'support' },
];

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
      {['ar', 'fr', 'en'].map((lng) => (
        <Button
          key={lng}
          variant={i18n.language === lng ? 'contained' : 'outlined'}
          onClick={() => i18n.changeLanguage(lng)}
        >
          {lng.toUpperCase()}
        </Button>
      ))}
    </Box>
  );
}

function App() {
  const { t } = useTranslation();
  const [page, setPage] = React.useState('login');

  return (
    <Box sx={{ p: 3, maxWidth: 500, mx: 'auto', direction: t('welcome').charCodeAt(0) > 200 ? 'rtl' : 'ltr' }}>
      <LanguageSwitcher />
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {pages.map((p) => (
          <Button key={p.key} variant={page === p.key ? 'contained' : 'outlined'} onClick={() => setPage(p.key)}>
            {t(p.label)}
          </Button>
        ))}
      </Box>
      <Box sx={{ minHeight: 200, bgcolor: '#f5f5f5', p: 2, borderRadius: 2 }}>
        {page === 'login' && <h2>{t('login')}</h2>}
        {page === 'register' && <h2>{t('register')}</h2>}
        {page === 'dashboard' && <h2>{t('dashboard')}</h2>}
        {page === 'transactions' && <h2>{t('transactions')}</h2>}
        {page === 'settings' && <h2>{t('settings')}</h2>}
        {page === 'support' && <h2>{t('support')}</h2>}
        <p>{t('welcome')}</p>
      </Box>
    </Box>
  );
}

export default App;
