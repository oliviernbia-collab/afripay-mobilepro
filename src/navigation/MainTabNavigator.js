import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
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

// Route names stay fixed French keys (used throughout for navigation.navigate calls) —
// only the visible tabBarLabel is translated here.
export default function MainTabNavigator() {
  const { t } = useTranslation();

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
      <Tab.Screen name="Accueil" component={DashboardScreen} options={{ tabBarLabel: t('nav.accueil') }} />
      <Tab.Screen
        name="Transferer"
        component={TransferScreen}
        options={{ tabBarLabel: t('nav.transferer'), title: t('nav.transferer') }}
      />
      <Tab.Screen name="Historique" component={HistoriqueScreen} options={{ tabBarLabel: t('nav.historique') }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ tabBarLabel: t('nav.notifications') }} />
      <Tab.Screen
        name="Parametres"
        component={SettingsScreen}
        options={{ tabBarLabel: t('nav.parametres'), title: t('nav.parametres') }}
      />
    </Tab.Navigator>
  );
}
