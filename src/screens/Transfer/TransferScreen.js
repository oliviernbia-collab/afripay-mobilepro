import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon';
import colors, { radii } from '../../theme/colors';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import IconRow from '../../components/IconRow';
import Card from '../../components/Card';
import { transferInterne, transferExterne, getFraisRetrait, MOBILE_MONEY_OPERATORS } from '../../api/transferts';
import { extractErrorMessage } from '../../api/client';
import { formatFcfa } from '../../utils/format';

// `icon`/`color` restent le repli FontAwesome (utilisé si `logo` est absent) ; `logo` est le vrai
// logo de marque (icône d'app officielle récupérée depuis le Play Store de chaque fournisseur —
// voir assets/providers/) affiché à la place dans IconRow.
const OPERATOR_META = {
  wave: { color: '#1DC8E3', icon: 'droplet', logo: require('../../../assets/providers/wave.png') },
  orange_money: { color: colors.orange, icon: 'mobile-screen', logo: require('../../../assets/providers/orange_money.png') },
  moov_money: { color: colors.blue, icon: 'tower-cell', logo: require('../../../assets/providers/moov_money.png') },
  mtn_money: { color: colors.gold, icon: 'sim-card', logo: require('../../../assets/providers/mtn_money.png') },
};

export default function TransferScreen() {
  const { t } = useTranslation();
  const [mode, setMode] = useState('externe'); // 'externe' | 'interne'

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('transfer.title')}</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, mode === 'externe' && styles.tabActive]}
          onPress={() => setMode('externe')}
        >
          <Text style={[styles.tabText, mode === 'externe' && styles.tabTextActive]}>{t('transfer.tabExternal')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, mode === 'interne' && styles.tabActive]}
          onPress={() => setMode('interne')}
        >
          <Text style={[styles.tabText, mode === 'interne' && styles.tabTextActive]}>{t('transfer.tabInternal')}</Text>
        </TouchableOpacity>
      </View>

      {mode === 'externe' ? <ExternalTransferForm /> : <InternalTransferForm />}
    </KeyboardAvoidingView>
  );
}

function ExternalTransferForm() {
  const { t } = useTranslation();
  const [operateur, setOperateur] = useState(MOBILE_MONEY_OPERATORS[0].value);
  const [numero, setNumero] = useState('');
  const [montant, setMontant] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [tauxFrais, setTauxFrais] = useState(null);

  useEffect(() => {
    // Silencieux si indisponible : l'aperçu ne s'affiche alors simplement pas, le retrait lui-même
    // n'en dépend pas (le frais réel, lui, est toujours calculé côté backend).
    getFraisRetrait()
      .then((data) => setTauxFrais(Number(data?.taux)))
      .catch(() => {});
  }, []);

  const montantValue = Number(montant || 0);
  // Aperçu avant confirmation : le wallet marchand est débité du plein montant (voir backend
  // transferService.externalTransfer), mais seul montant - frais part réellement vers le Mobile
  // Money du marchand.
  const previewActif = Number.isFinite(tauxFrais) && montantValue > 0;
  const fraisPreview = previewActif ? Math.round(montantValue * tauxFrais) : 0;
  const recuPreview = previewActif ? montantValue - fraisPreview : 0;

  const handleSubmit = async () => {
    setError('');
    setSuccess(null);
    if (!numero || !montantValue) {
      setError(t('transfer.missingFieldsExternal'));
      return;
    }
    // Le PIN AfriPay confirme désormais systématiquement tout transfert (le backend le rejette
    // sans lui, quel que soit le montant) — ce n'est plus conditionné à un seuil.
    if (!pin) {
      setError(t('transfer.pinRequired'));
      return;
    }
    setLoading(true);
    try {
      const result = await transferExterne({
        operateurDestination: operateur,
        numeroDestinataire: numero,
        montant: montantValue,
        pin,
      });
      setSuccess(result);
      setNumero('');
      setMontant('');
      setPin('');
    } catch (e) {
      setError(extractErrorMessage(e, t('transfer.genericError')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
      <Card style={styles.card}>
        <Text style={styles.label}>{t('transfer.operatorLabel')}</Text>
        {MOBILE_MONEY_OPERATORS.map((op) => {
          const meta = OPERATOR_META[op.value] || { color: colors.turquoise, icon: 'wallet' };
          return (
            <IconRow
              key={op.value}
              icon={meta.icon}
              iconColor={meta.color}
              image={meta.logo}
              label={t(`providers.${op.value}`, { defaultValue: op.label })}
              selected={operateur === op.value}
              onPress={() => setOperateur(op.value)}
              showChevron={false}
              right={operateur === op.value ? <Icon name="circle-check" size={18} color={meta.color} /> : null}
            />
          );
        })}

        <Input
          label={t('transfer.externalNumberLabel')}
          placeholder={t('transfer.numberPlaceholder')}
          keyboardType="phone-pad"
          value={numero}
          onChangeText={setNumero}
        />
        <Input
          label={t('transfer.amountLabel')}
          placeholder="0"
          keyboardType="number-pad"
          value={montant}
          onChangeText={(v) => setMontant(v.replace(/[^0-9]/g, ''))}
        />

        {previewActif ? (
          <View style={styles.feePreviewCard}>
            <View style={styles.feePreviewRow}>
              <Text style={styles.feePreviewLabel}>
                {t('transfer.feePreviewFees', { taux: `${Math.round(tauxFrais * 1000) / 10}%` })}
              </Text>
              <Text style={styles.feePreviewValue}>-{formatFcfa(fraisPreview)}</Text>
            </View>
            <View style={styles.feePreviewRow}>
              <Text style={styles.feePreviewLabelStrong}>
                {t('transfer.feePreviewReceived', { operator: t(`providers.${operateur}`, { defaultValue: operateur }) })}
              </Text>
              <Text style={styles.feePreviewValueStrong}>{formatFcfa(recuPreview)}</Text>
            </View>
          </View>
        ) : null}

        <Input
          label={t('transfer.pinLabel')}
          placeholder="••••"
          secureTextEntry
          keyboardType="number-pad"
          value={pin}
          onChangeText={setPin}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {success ? (
          // Le retrait est confirmé de façon asynchrone par Jèko (webhook) — le wallet est
          // débité tout de suite (voir transferService.externalTransfer), mais "réussi" n'est vrai
          // qu'une fois la confirmation reçue, pas à cet instant.
          <Text style={styles.successText}>
            {t('transfer.pendingExternal', { operator: t(`providers.${operateur}`, { defaultValue: operateur }) })}
          </Text>
        ) : null}

        <GradientButton title={t('transfer.submit')} onPress={handleSubmit} loading={loading} icon={<Icon name="paper-plane" size={16} color={colors.text} />} />
      </Card>
    </ScrollView>
  );
}

function InternalTransferForm() {
  const { t } = useTranslation();
  const [telephone, setTelephone] = useState('');
  const [montant, setMontant] = useState('');
  const [libelle, setLibelle] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const montantValue = Number(montant || 0);

  const handleSubmit = async () => {
    setError('');
    setSuccess(null);
    if (!telephone || !montantValue) {
      setError(t('transfer.missingFieldsInternal'));
      return;
    }
    if (!pin) {
      setError(t('transfer.pinRequired'));
      return;
    }
    setLoading(true);
    try {
      const result = await transferInterne({
        telephoneDestinataire: telephone,
        montant: montantValue,
        libelle: libelle || undefined,
        pin,
      });
      setSuccess(result);
      setTelephone('');
      setMontant('');
      setLibelle('');
      setPin('');
    } catch (e) {
      setError(extractErrorMessage(e, t('transfer.genericError')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
      <Card style={styles.card}>
        <Input
          label={t('transfer.internalNumberLabel')}
          placeholder={t('transfer.numberPlaceholder')}
          keyboardType="phone-pad"
          value={telephone}
          onChangeText={setTelephone}
        />
        <Input
          label={t('transfer.amountLabel')}
          placeholder="0"
          keyboardType="number-pad"
          value={montant}
          onChangeText={(v) => setMontant(v.replace(/[^0-9]/g, ''))}
        />
        <Input
          label={t('transfer.noteLabel')}
          placeholder={t('transfer.notePlaceholder')}
          value={libelle}
          onChangeText={setLibelle}
        />
        <Input
          label={t('transfer.pinLabel')}
          placeholder="••••"
          secureTextEntry
          keyboardType="number-pad"
          value={pin}
          onChangeText={setPin}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {success ? <Text style={styles.successText}>{t('transfer.successInternal')}</Text> : null}

        <GradientButton title={t('transfer.submit')} onPress={handleSubmit} loading={loading} icon={<Icon name="paper-plane" size={16} color={colors.text} />} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 20 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.sm,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.magenta },
  tabText: { color: colors.textSecondary, fontSize: 12.5, fontWeight: '600' },
  tabTextActive: { color: colors.text },
  form: { padding: 20, paddingBottom: 60 },
  card: { paddingVertical: 20 },
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 8, fontWeight: '500' },
  errorText: { color: colors.error, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  successText: { color: colors.success, fontSize: 13, marginBottom: 12, textAlign: 'center', fontWeight: '600' },
  feePreviewCard: {
    backgroundColor: colors.background,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 6,
    marginBottom: 12,
  },
  feePreviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feePreviewLabel: { color: colors.textSecondary, fontSize: 13 },
  feePreviewValue: { color: colors.textSecondary, fontSize: 13 },
  feePreviewLabelStrong: { color: colors.text, fontSize: 14, fontWeight: '700' },
  feePreviewValueStrong: { color: colors.text, fontSize: 14, fontWeight: '700' },
});
