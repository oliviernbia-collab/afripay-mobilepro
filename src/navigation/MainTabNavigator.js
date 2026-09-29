import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.turquoise,
        tabBarStyle: {
          backgroundColor: colors.backgroundAlt,
          borderTopColor: colors.border,
          // Hauteur/marge basse fixes (62/8) ignoraient la zone de sécurité du téléphone (barre de
          // navigation Android à 3 boutons, geste iPhone...) — sur les appareils avec une barre
          // système visible, nos propres icônes se retrouvaient collées/mélangées à celle-ci.
          // useSafeAreaInsets() donne l'espace réel à réserver en plus, par appareil.
          height: 62 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
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
