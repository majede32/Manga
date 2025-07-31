import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

// Layout Components
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';

// Pages
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Accounts from './pages/Accounts/Accounts';
import Transfers from './pages/Transfers/Transfers';
import Loans from './pages/Loans/Loans';
import Services from './pages/Services/Services';
import Profile from './pages/Profile/Profile';
import Support from './pages/Support/Support';

// Redux
import { RootState } from './store/store';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const loading = useSelector((state: RootState) => state.auth.loading);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        className="fade-in"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

// Main Layout Component
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { t } = useTranslation();

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar onMenuClick={handleSidebarToggle} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: { xs: 2, sm: 3 },
          marginTop: { xs: 7, sm: 8 },
          marginLeft: { sm: sidebarOpen ? 30 : 0 },
          transition: 'margin-left 0.3s ease',
          backgroundColor: 'background.default',
        }}
        className="fade-in"
      >
        {children}
      </Box>
    </Box>
  );
};

function App() {
  const { t, i18n } = useTranslation();
  const loading = useSelector((state: RootState) => state.auth.loading);
  
  // Set document direction based on language
  React.useEffect(() => {
    const direction = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', i18n.language);
  }, [i18n.language]);

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        className="gradient-primary"
        color="white"
      >
        <CircularProgress size={60} color="inherit" />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {t('loading')}
        </Typography>
      </Box>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Accounts />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transfers"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Transfers />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/loans"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Loans />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/services"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Services />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Profile />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Support />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* 404 fallback */}
        <Route
          path="*"
          element={
            <Box 
              display="flex" 
              flexDirection="column"
              justifyContent="center" 
              alignItems="center" 
              minHeight="100vh"
              textAlign="center"
              px={2}
            >
              <Typography variant="h1" color="primary" sx={{ fontSize: '8rem', fontWeight: 'bold' }}>
                404
              </Typography>
              <Typography variant="h4" sx={{ mb: 2 }}>
                الصفحة غير موجودة
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                عذراً، الصفحة التي تبحث عنها غير موجودة
              </Typography>
            </Box>
          }
        />
      </Routes>
    </div>
  );
}

export default App;