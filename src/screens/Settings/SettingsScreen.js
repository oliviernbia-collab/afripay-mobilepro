import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Alert,
  Share,
  ActivityIndicator,
  Switch,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon';
import colors, { radii } from '../../theme/colors';
import Card from '../../components/Card';
import { KybBadge } from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { resolveMediaUrl } from '../../config/api';
import { uploadMyLogo, removeMyLogo } from '../../api/kyc';
import { extractErrorMessage } from '../../api/client';
import {
  getBiometricCapability,
  isBiometricLockEnabled,
  setBiometricLockEnabled,
  promptBiometricUnlock,
} from '../../utils/biometricLock';

// Logo d'entreprise : tap ouvre caméra/galerie, appui long (ou option dédiée) propose de le
// retirer. Met à jour AuthContext via refreshMerchant() pour refléter le changement partout
// (écran d'accueil, reçus, etc.) — même schéma que la photo de profil côté mobileclient.
function MerchantLogo({ merchant }) {
  const { t } = useTranslation();
  const { refreshMerchant } = useAuth();
  const { showWarning, showError, showSuccess } = useToast();
  const [uploading, setUploading] = useState(false);

  const pickAndUpload = async (fromCamera) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showWarning(t('settings.logo.permissionDeniedText'));
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7, mediaTypes: ['images'] })
      : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7, mediaTypes: ['images'] });
    if (result.canceled || !result.assets?.[0]) return;

    setUploading(true);
    try {
      await uploadMyLogo(result.assets[0].uri);
      await refreshMerchant();
      showSuccess(t('settings.logo.uploadSuccess'));
    } catch (e) {
      showError(extractErrorMessage(e, t('settings.logo.uploadError')));
    } finally {
      setUploading(false);
    }
  };

  const onRemove = () => {
    Alert.alert(t('settings.logo.removeConfirmTitle'), t('settings.logo.removeConfirmText'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.logo.remove'),
        style: 'destructive',
        onPress: async () => {
          setUploading(true);
          try {
            await removeMyLogo();
            await refreshMerchant();
            showSuccess(t('settings.logo.removeSuccess'));
          } catch (e) {
            showError(extractErrorMessage(e, t('settings.logo.removeError')));
          } finally {
            setUploading(false);
          }
        },
      },
    ]);
  };

  const onPress = () => {
    const options = [
      { text: t('settings.logo.takePhoto'), onPress: () => pickAndUpload(true) },
      { text: t('settings.logo.chooseGallery'), onPress: () => pickAndUpload(false) },
    ];
    if (merchant?.logo_url) options.push({ text: t('settings.logo.remove'), style: 'destructive', onPress: onRemove });
    options.push({ text: t('common.cancel'), style: 'cancel' });
    Alert.alert(t('settings.logo.title'), undefined, options);
  };

  return (
    <Pressable onPress={onPress} disabled={uploading} style={styles.avatar}>
      {uploading ? (
        <ActivityIndicator color={colors.text} />
      ) : merchant?.logo_url ? (
        <Image source={{ uri: resolveMediaUrl(merchant.logo_url) }} style={styles.avatarImage} />
      ) : (
        <Icon name="store" size={26} color={colors.text} />
      )}
      <View style={styles.avatarEditBadge}>
        <Icon name="camera" size={10} color={colors.text} />
      </View>
    </Pressable>
  );
}

// Rend sa propre section (label + carte) et rien du tout sur un appareil sans matériel/
// enrôlement biométrique — même schéma que mobileclient/src/screens/ParametresScreen.js.
function BiometricLockSection() {
  const { t } = useTranslation();
  const { showWarning, showSuccess } = useToast();
  const [available, setAvailable] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const [capability, current] = await Promise.all([getBiometricCapability(), isBiometricLockEnabled()]);
      setAvailable(capability.available);
      setEnabled(current);
    })();
  }, []);

  const onToggle = async (next) => {
    setBusy(true);
    try {
      if (next) {
        // Confirme que l'utilisateur peut réellement s'authentifier avant d'activer le
        // verrouillage, pour ne jamais risquer de bloquer l'accès à son propre compte.
        const ok = await promptBiometricUnlock();
        if (!ok) {
          showWarning(t('settings.biometricActivationCancelledText'));
          return;
        }
      }
      await setBiometricLockEnabled(next);
      setEnabled(next);
      showSuccess(t(next ? 'settings.biometricEnabledSuccess' : 'settings.biometricDisabledSuccess'));
    } finally {
      setBusy(false);
    }
  };

  if (!available) return null;

  return (
    <>
      <Text style={styles.sectionTitle}>{t('settings.sectionSecurity')}</Text>
      <Card style={styles.switchCard}>
        <View style={styles.menuRow}>
          <Icon name="fingerprint" size={20} color={colors.turquoise} />
          <View style={{ flex: 1 }}>
            <Text style={styles.menuLabel}>{t('settings.biometricLockTitle')}</Text>
            <Text style={styles.switchSubtitle}>{t('settings.biometricLockSubtitle')}</Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={onToggle}
            disabled={busy}
            trackColor={{ true: colors.turquoise, false: colors.border }}
            thumbColor={colors.text}
          />
        </View>
      </Card>
    </>
  );
}

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
          <MerchantLogo merchant={merchant} />
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

      <BiometricLockSection />

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
    overflow: 'visible',
  },
  avatarImage: { width: 50, height: 50, borderRadius: radii.lg },
  avatarEditBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.turquoise,
    borderWidth: 2,
    borderColor: colors.background,
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
  switchCard: { marginBottom: 10, paddingVertical: 4 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuLabel: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '600' },
  switchSubtitle: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
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
