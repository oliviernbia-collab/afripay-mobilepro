import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon';
import colors, { radii } from '../../theme/colors';
import Card from '../../components/Card';
import { KybBadge } from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export default function SettingsScreen({ navigation }) {
  const { t } = useTranslation();
  const { merchant, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(t('settings.logoutConfirmTitle'), t('settings.logoutConfirmText'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.logout'), style: 'destructive', onPress: logout },
    ]);
  };

  const onShareApp = () => {
    Share.share({ message: t('about.shareMessage') });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('settings.title')}</Text>

      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Icon name="store" size={26} color={colors.text} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{merchant?.raison_sociale || t('settings.defaultMerchantName')}</Text>
            <Text style={styles.profilePhone}>{merchant?.telephone}</Text>
          </View>
          <KybBadge statut={merchant?.statut_kyb} />
        </View>
        <View style={styles.profileDetails}>
          <DetailRow
            label={t('settings.typeLabel')}
            value={merchant?.type === 'entreprise' ? t('settings.typeEntreprise') : t('settings.typeParticulier')}
          />
          {merchant?.email ? <DetailRow label={t('settings.emailLabel')} value={merchant.email} /> : null}
          {merchant?.rccm ? <DetailRow label={t('settings.rccmLabel')} value={merchant.rccm} /> : null}
          {merchant?.ncc ? <DetailRow label={t('settings.nccLabel')} value={merchant.ncc} /> : null}
        </View>
      </Card>

      <Text style={styles.sectionTitle}>{t('settings.sectionAccount')}</Text>
      <MenuItem icon="shield-halved" label={t('settings.kybMenu')} onPress={() => navigation.navigate('Kyb')} />
      <MenuItem icon="key" label={t('settings.pinMenu')} onPress={() => navigation.navigate('ChangePin')} />

      <Text style={styles.sectionTitle}>{t('settings.sectionHelp')}</Text>
      <MenuItem icon="circle-question" label={t('settings.helpMenu')} onPress={() => navigation.navigate('Support')} />
      <MenuItem icon="share-nodes" label={t('settings.shareApp')} onPress={onShareApp} />

      <Text style={styles.sectionTitle}>{t('settings.sectionLegal')}</Text>
      <MenuItem icon="file-contract" label={t('settings.termsMenu')} onPress={() => navigation.navigate('Terms')} />
      <MenuItem icon="user-shield" label={t('settings.privacyMenu')} onPress={() => navigation.navigate('Privacy')} />
      <MenuItem icon="circle-info" label={t('about.title')} onPress={() => navigation.navigate('About')} />

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Icon name="right-from-bracket" size={20} color={colors.error} />
        <Text style={styles.logoutText}>{t('settings.logout')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function MenuItem({ icon, label, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.menuCard}>
        <View style={styles.menuRow}>
          <Icon name={icon} size={20} color={colors.turquoise} />
          <Text style={styles.menuLabel}>{label}</Text>
          <Icon name="chevron-right" size={18} color={colors.textMuted} />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: 16 },
  profileCard: { marginBottom: 24 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: radii.lg,
    backgroundColor: colors.violet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  profilePhone: { color: colors.textSecondary, fontSize: 12.5, marginTop: 2 },
  profileDetails: { marginTop: 16, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  detailLabel: { color: colors.textMuted, fontSize: 12.5 },
  detailValue: { color: colors.text, fontSize: 12.5, fontWeight: '600' },
  sectionTitle: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 10, marginTop: 4 },
  menuCard: { marginBottom: 10 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuLabel: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '600' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: { color: colors.error, fontSize: 14, fontWeight: '700' },
});
