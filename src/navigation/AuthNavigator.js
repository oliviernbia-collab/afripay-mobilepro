import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import colors from '../theme/colors';

import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterTypeScreen from '../screens/Auth/RegisterTypeScreen';
import RegisterFormScreen from '../screens/Auth/RegisterFormScreen';
import OtpScreen from '../screens/Auth/OtpScreen';
import SetPinScreen from '../screens/Auth/SetPinScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
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
      <Stack.Screen name="RegisterType" component={RegisterTypeScreen} options={{ title: 'Créer un compte' }} />
      <Stack.Screen name="RegisterForm" component={RegisterFormScreen} options={{ title: 'Vos informations' }} />
      <Stack.Screen name="Otp" component={OtpScreen} options={{ title: 'Vérification' }} />
      <Stack.Screen name="SetPin" component={SetPinScreen} options={{ title: 'Code PIN', headerBackVisible: false }} />
    </Stack.Navigator>
  );
}
