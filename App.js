import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import './src/i18n';
import { LanguageProvider } from './src/context/LanguageContext';
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';
import RootNavigator from './src/navigation/RootNavigator';
import colors from './src/theme/colors';
import { initOfflineReadQueue } from './src/utils/offlineReadQueue';
import { markNotificationRead } from './src/api/notifications';

const navigationTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
    primary: colors.magenta,
  },
};

export default function App() {
  useEffect(() => {
    initOfflineReadQueue(markNotificationRead);
  }, []);

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <NavigationContainer theme={navigationTheme}>
            <ToastProvider>
              <StatusBar style="light" />
              <RootNavigator />
            </ToastProvider>
          </NavigationContainer>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
