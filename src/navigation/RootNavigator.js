import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import colors from '../theme/colors';
import { useAuth } from '../context/AuthContext';

import SplashScreen from '../screens/SplashScreen';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';

import AmountScreen from '../screens/Encaisser/AmountScreen';
import ScanScreen from '../screens/Encaisser/ScanScreen';
import ReceiptScreen from '../screens/Encaisser/ReceiptScreen';

import KybScreen from '../screens/Kyb/KybScreen';
import KybUploadScreen from '../screens/Kyb/KybUploadScreen';

import TransactionDetailScreen from '../screens/Historique/TransactionDetailScreen';
import ChangePinScreen from '../screens/Settings/ChangePinScreen';
import AboutScreen from '../screens/Settings/AboutScreen';
import SupportScreen from '../screens/Settings/SupportScreen';
import TermsScreen from '../screens/Settings/TermsScreen';
import PrivacyScreen from '../screens/Settings/PrivacyScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { t } = useTranslation();
  const { initializing, isAuthenticated } = useAuth();

  const screenOptions = {
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.text,
    headerShadowVisible: false,
    contentStyle: { backgroundColor: colors.background },
  };

  if (initializing) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />

          <Stack.Screen name="EncaisserAmount" component={AmountScreen} options={{ title: t('headers.encaisser') }} />
          <Stack.Screen
            name="EncaisserScan"
            component={ScanScreen}
            options={{ title: t('headers.scanPayment'), headerBackVisible: true }}
          />
          <Stack.Screen
            name="EncaisserReceipt"
            component={ReceiptScreen}
            options={{ title: t('headers.receipt'), headerBackVisible: false, gestureEnabled: false }}
          />

          <Stack.Screen name="Kyb" component={KybScreen} options={{ title: t('headers.kyb') }} />
          <Stack.Screen name="KybUpload" component={KybUploadScreen} options={{ title: t('headers.kybUpload') }} />

          <Stack.Screen
            name="TransactionDetail"
            component={TransactionDetailScreen}
            options={{ title: t('headers.transactionDetail') }}
          />
          <Stack.Screen name="ChangePin" component={ChangePinScreen} options={{ title: t('headers.changePin') }} />
          <Stack.Screen name="About" component={AboutScreen} options={{ title: t('headers.about') }} />
          <Stack.Screen name="Support" component={SupportScreen} options={{ title: t('headers.support') }} />
          <Stack.Screen name="Terms" component={TermsScreen} options={{ title: t('headers.terms') }} />
          <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ title: t('headers.privacy') }} />
        </>
      )}
    </Stack.Navigator>
  );
}
