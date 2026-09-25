import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import colors from '../theme/colors';

import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterTypeScreen from '../screens/Auth/RegisterTypeScreen';
import RegisterFormScreen from '../screens/Auth/RegisterFormScreen';
import OtpScreen from '../screens/Auth/OtpScreen';
import SetPinScreen from '../screens/Auth/SetPinScreen';
import ForgotAccessPhoneScreen from '../screens/Auth/ForgotAccessPhoneScreen';
import ForgotAccessResetScreen from '../screens/Auth/ForgotAccessResetScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RegisterType" component={RegisterTypeScreen} options={{ title: t('headers.createAccount') }} />
      <Stack.Screen name="RegisterForm" component={RegisterFormScreen} options={{ title: t('headers.yourInfo') }} />
      <Stack.Screen name="Otp" component={OtpScreen} options={{ title: t('headers.verification') }} />
      <Stack.Screen
        name="SetPin"
        component={SetPinScreen}
        options={{ title: t('headers.pinCode'), headerBackVisible: false }}
      />
      <Stack.Screen name="ForgotAccessPhone" component={ForgotAccessPhoneScreen} options={{ title: '' }} />
      <Stack.Screen name="ForgotAccessReset" component={ForgotAccessResetScreen} options={{ title: '' }} />
    </Stack.Navigator>
  );
}
