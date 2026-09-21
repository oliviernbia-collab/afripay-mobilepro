import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.text,
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
};

export default function RootNavigator() {
  const { initializing, isAuthenticated } = useAuth();

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

          <Stack.Screen name="EncaisserAmount" component={AmountScreen} options={{ title: 'Encaisser' }} />
          <Stack.Screen
            name="EncaisserScan"
            component={ScanScreen}
            options={{ title: 'Scanner le paiement AfriPay', headerBackVisible: true }}
          />
          <Stack.Screen
            name="EncaisserReceipt"
            component={ReceiptScreen}
            options={{ title: 'Reçu', headerBackVisible: false, gestureEnabled: false }}
          />

          <Stack.Screen name="Kyb" component={KybScreen} options={{ title: 'Validation du compte (KYB)' }} />
          <Stack.Screen name="KybUpload" component={KybUploadScreen} options={{ title: 'Envoyer un document' }} />

          <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} options={{ title: 'Détail' }} />
          <Stack.Screen name="ChangePin" component={ChangePinScreen} options={{ title: 'Code PIN AfriPay' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
