import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PinDots from '../../components/PinDots';
import PinKeypad from '../../components/PinKeypad';
import Icon from '../../components/Icon';
import colors, { radii } from '../../theme/colors';
import { setMerchantPin } from '../../api/auth';
import { extractErrorMessage } from '../../api/client';

const PIN_LENGTH = 4;
const STAGES = ['enter', 'confirm'];

export default function ChangePinScreen({ navigation }) {
  const [stage, setStage] = useState('enter'); // 'enter' | 'confirm'
  const [firstPin, setFirstPin] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const stepIndex = STAGES.indexOf(stage);

  const submit = async (confirmedPin) => {
    setLoading(true);
    try {
      await setMerchantPin(confirmedPin);
      setSuccess(true);
      setTimeout(() => navigation.goBack(), 900);
    } catch (e) {
      setError(extractErrorMessage(e, 'Impossible de mettre à jour le code PIN.'));
      setStage('enter');
      setFirstPin('');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const onDigit = (d) => {
    if (loading || success || pin.length >= PIN_LENGTH) return;
    setError('');
    const next = pin + d;
    setPin(next);
    if (next.length === PIN_LENGTH) {
      if (stage === 'enter') {
        setTimeout(() => {
          setFirstPin(next);
          setStage('confirm');
          setPin('');
        }, 150);
      } else if (next === firstPin) {
        submit(next);
      } else {
        setTimeout(() => {
          setError('Les codes PIN ne correspondent pas. Recommencez.');
          setStage('enter');
          setFirstPin('');
          setPin('');
        }, 150);
      }
    }
  };

  const onBackspace = () => {
    if (loading) return;
    setPin((p) => p.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Icon name="key" size={24} color={colors.turquoise} />
      </View>

      <View style={styles.progressRow}>
        {STAGES.map((s, i) => (
          <View key={s} style={[styles.progressSegment, i <= stepIndex && styles.progressSegmentDone]} />
        ))}
      </View>
      <Text style={styles.progressLabel}>Étape {stepIndex + 1} sur {STAGES.length}</Text>

      <Text style={styles.title}>{stage === 'enter' ? 'Nouveau code PIN' : 'Confirmez votre code PIN'}</Text>
      <Text style={styles.subtitle}>
        {stage === 'enter'
          ? 'Ce code à 4 chiffres est demandé pour confirmer les transferts à partir de 50 000 FCFA.'
          : 'Saisissez à nouveau le même code pour le confirmer.'}
      </Text>

      {error ? (
        <View style={styles.errorBanner}>
          <Icon name="circle-exclamation" size={14} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      {success ? (
        <View style={styles.successBanner}>
          <Icon name="circle-check" size={14} color={colors.success} />
          <Text style={styles.successText}>Code PIN mis à jour.</Text>
        </View>
      ) : null}

      <PinDots length={pin.length} minSlots={PIN_LENGTH} />

      <PinKeypad onDigit={onDigit} onBackspace={onBackspace} disabled={loading || success} />

      <View style={styles.securityNote}>
        <Icon name="shield-halved" size={13} color={colors.textMuted} />
        <Text style={styles.securityNoteText}>
          Ne partagez jamais ce code. AfriPay ne vous le demandera jamais par téléphone ou SMS.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24, paddingTop: 24 },
  iconWrap: {
    alignSelf: 'center',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: `${colors.turquoise}1F`,
    borderWidth: 1,
    borderColor: `${colors.turquoise}55`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  progressRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  progressSegment: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.border },
  progressSegmentDone: { backgroundColor: colors.turquoise },
  progressLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '600', marginBottom: 20 },
  title: { color: colors.text, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 6, textAlign: 'center', lineHeight: 19 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${colors.error}1A`,
    borderWidth: 1,
    borderColor: `${colors.error}55`,
    borderRadius: radii.md,
    padding: 10,
    marginTop: 14,
  },
  errorText: { flex: 1, color: colors.error, fontSize: 12.5, fontWeight: '600' },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${colors.success}1A`,
    borderWidth: 1,
    borderColor: `${colors.success}55`,
    borderRadius: radii.md,
    padding: 10,
    marginTop: 14,
  },
  successText: { flex: 1, color: colors.success, fontSize: 12.5, fontWeight: '600' },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 'auto',
    paddingTop: 20,
    paddingBottom: 8,
  },
  securityNoteText: { flex: 1, color: colors.textMuted, fontSize: 11.5, lineHeight: 16 },
});
