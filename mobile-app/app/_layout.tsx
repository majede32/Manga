import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { I18nManager } from 'react-native';
import { useState } from 'react';
import { View, Text, Button } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import './i18n';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', margin: 8 }}>
      {['ar', 'fr', 'en'].map((lng) => (
        <Button
          key={lng}
          title={lng.toUpperCase()}
          onPress={() => {
            i18n.changeLanguage(lng);
            if (lng === 'ar') I18nManager.forceRTL(true);
            else I18nManager.forceRTL(false);
          }}
          color={i18n.language === lng ? '#1976d2' : '#aaa'}
        />
      ))}
    </View>
  );
}

export default function RootLayout() {
  const { t } = useTranslation();
  const [page, setPage] = useState('login');
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>
      <LanguageSwitcher />
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
        {['login', 'register', 'dashboard', 'transactions', 'settings', 'support'].map((p) => (
          <Button
            key={p}
            title={t(p)}
            onPress={() => setPage(p)}
            color={page === p ? '#1976d2' : '#aaa'}
          />
        ))}
      </View>
      <View style={{ flex: 1, backgroundColor: '#f5f5f5', borderRadius: 8, padding: 16 }}>
        {page === 'login' && <Text style={{ fontSize: 22 }}>{t('login')}</Text>}
        {page === 'register' && <Text style={{ fontSize: 22 }}>{t('register')}</Text>}
        {page === 'dashboard' && <Text style={{ fontSize: 22 }}>{t('dashboard')}</Text>}
        {page === 'transactions' && <Text style={{ fontSize: 22 }}>{t('transactions')}</Text>}
        {page === 'settings' && <Text style={{ fontSize: 22 }}>{t('settings')}</Text>}
        {page === 'support' && <Text style={{ fontSize: 22 }}>{t('support')}</Text>}
        <Text style={{ marginTop: 12 }}>{t('welcome')}</Text>
      </View>
    </View>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
