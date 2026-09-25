import React, { useEffect, useState } from 'react';
import { Modal, View, Text, Image, Pressable, StyleSheet, Animated, Dimensions, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';
import { KybBadge } from './StatusBadge';
import Card from './Card';
import colors, { radii } from '../theme/colors';
import { resolveMediaUrl } from '../config/api';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MENU_WIDTH = Math.min(SCREEN_WIDTH * 0.8, 320);

const MENU_ITEMS = [
  { key: 'Kyb', icon: 'shield-halved', labelKey: 'settings.kybMenu' },
  { key: 'ChangePin', icon: 'key', labelKey: 'settings.pinMenu' },
  { key: 'Parametres', icon: 'gear', labelKey: 'sideMenu.allSettings', isTab: true },
];

// Menu latéral "coulisant" ouvert depuis l'icône marchand du tableau de bord — accès rapide au
// profil et aux sections clés du compte sans quitter l'écran d'accueil (voir mobileclient's
// SideMenu.js, dont ce composant reprend la même mécanique d'animation).
export default function SideMenu({ visible, onClose, merchant, navigation, onLogout }) {
  const { t } = useTranslation();
  const [translateX] = useState(() => new Animated.Value(-MENU_WIDTH));
  const [backdropOpacity] = useState(() => new Animated.Value(0));
  const [prevVisible, setPrevVisible] = useState(visible);
  const [closing, setClosing] = useState(false);
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (!visible) setClosing(true);
  }

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateX, { toValue: 0, duration: 260, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
      ]).start();
    } else if (closing) {
      Animated.parallel([
        Animated.timing(translateX, { toValue: -MENU_WIDTH, duration: 220, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setClosing(false);
      });
    }
  }, [visible, closing, translateX, backdropOpacity]);

  if (!visible && !closing) return null;

  const go = (item) => {
    onClose();
    if (item.isTab) {
      navigation.navigate('Main', { screen: item.key });
    } else {
      navigation.navigate(item.key);
    }
  };

  const confirmLogout = () => {
    onClose();
    Alert.alert(t('settings.logoutConfirmTitle'), t('settings.logoutConfirmText'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.logout'), style: 'destructive', onPress: onLogout },
    ]);
  };

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.panel, { width: MENU_WIDTH, transform: [{ translateX }] }]}>
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.panelContent}>
              <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
                <Icon name="xmark" size={16} color={colors.textSecondary} />
              </Pressable>

              <Card style={styles.profileCard}>
                <View style={styles.avatar}>
                  {merchant?.logo_url ? (
                    <Image source={{ uri: resolveMediaUrl(merchant.logo_url) }} style={styles.avatarImage} />
                  ) : (
                    <Icon name="store" size={26} color={colors.text} />
                  )}
                </View>
                <Text style={styles.name} numberOfLines={1}>
                  {merchant?.raison_sociale || t('settings.defaultMerchantName')}
                </Text>
                <Text style={styles.phone}>{merchant?.telephone}</Text>
                <View style={{ marginTop: 8 }}>
                  <KybBadge statut={merchant?.statut_kyb} />
                </View>
              </Card>

              <Card style={styles.menuCard}>
                {MENU_ITEMS.map((item, i) => (
                  <Pressable
                    key={item.key}
                    style={({ pressed }) => [
                      styles.item,
                      i < MENU_ITEMS.length - 1 && styles.itemDivider,
                      pressed && styles.itemPressed,
                    ]}
                    onPress={() => go(item)}
                  >
                    <View style={styles.itemIcon}>
                      <Icon name={item.icon} size={14} color={colors.turquoise} />
                    </View>
                    <Text style={styles.itemLabel}>{t(item.labelKey)}</Text>
                    <Icon name="chevron-right" size={13} color={colors.textMuted} />
                  </Pressable>
                ))}
              </Card>

              <Pressable
                style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]}
                onPress={confirmLogout}
              >
                <Icon name="right-from-bracket" size={15} color={colors.error} />
                <Text style={styles.logoutText}>{t('settings.logout')}</Text>
              </Pressable>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.card,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 16,
  },
  panelContent: { padding: 20, paddingBottom: 32 },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.background,
    marginBottom: 16,
  },
  menuCard: {
    backgroundColor: colors.background,
    padding: 6,
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: radii.lg,
    backgroundColor: colors.violet,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  avatarImage: { width: 60, height: 60 },
  name: { color: colors.text, fontWeight: '700', fontSize: 15 },
  phone: { color: colors.textSecondary, fontSize: 12.5, marginTop: 2 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: radii.md,
  },
  itemDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  itemPressed: { backgroundColor: colors.card },
  itemIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: `${colors.turquoise}22`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemLabel: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '600' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 13,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: `${colors.error}55`,
    backgroundColor: `${colors.error}14`,
  },
  logoutBtnPressed: { backgroundColor: `${colors.error}26` },
  logoutText: { color: colors.error, fontSize: 14, fontWeight: '700' },
});
