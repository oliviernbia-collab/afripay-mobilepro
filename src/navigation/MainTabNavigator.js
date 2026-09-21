import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '../components/Icon';
import colors from '../theme/colors';

import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import TransferScreen from '../screens/Transfer/TransferScreen';
import HistoriqueScreen from '../screens/Historique/HistoriqueScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

const Tab = createBottomTabNavigator();

const ICONS = {
  Accueil: 'house',
  Transferer: 'right-left',
  Historique: 'clock-rotate-left',
  Notifications: 'bell',
  Parametres: 'gear',
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.turquoise,
        tabBarStyle: {
          backgroundColor: colors.backgroundAlt,
          borderTopColor: colors.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size, focused }) => (
          <Icon name={ICONS[route.name] || 'circle'} size={size ? size - 2 : 20} color={focused ? colors.magenta : color} />
        ),
      })}
    >
      <Tab.Screen name="Accueil" component={DashboardScreen} />
      <Tab.Screen name="Transferer" component={TransferScreen} options={{ title: 'Transférer' }} />
      <Tab.Screen name="Historique" component={HistoriqueScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Parametres" component={SettingsScreen} options={{ title: 'Paramètres' }} />
    </Tab.Navigator>
  );
}
