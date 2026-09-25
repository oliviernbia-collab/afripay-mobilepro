import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import PinDots from '../../components/PinDots';
import PinKeypad from '../../components/PinKeypad';
import Icon from '../../components/Icon';
import Card from '../../components/Card';
import colors, { radii } from '../../theme/colors';
import { setMerchantPin } from '../../api/auth';
import { extractErrorMessage } from '../../api/client';

const PIN_LENGTH = 4;
// Le backend exige désormais le PIN actuel pour en définir un nouveau (POST /auth/marchand/pin
// refuse sans `pinActuel` dès qu'un PIN existe déjà) — sans quoi une session volée (token encore
// valide) suffirait à remplacer le PIN sans le connaître.
const STAGES = ['current', 'enter', 'confirm'];

export default function ChangePinScreen({ navigation }) {
  const { t } = useTranslation();
  const [stage, setStage] = useState('current'); // 'current' | 'enter' | 'confirm'
  const [currentPin, setCurrentPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const stepIndex = STAGES.indexOf(stage);

  const submit = async (confirmedPin) => {
    setLoading(true);
    try {
      await setMerchantPin(confirmedPin, currentPin);
      setSuccess(true);
      setTimeout(() => navigation.goBack(), 900);
    } catch (e) {
      setError(extractErrorMessage(e, t('changePin.saveError')));
      setStage('current');
      setCurrentPin('');
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
      if (stage === 'current') {
        setTimeout(() => {
          setCurrentPin(next);
          setStage('enter');
          setPin('');
        }, 150);
      } else if (stage === 'enter') {
        setTimeout(() => {
          setFirstPin(next);
          setStage('confirm');
          setPin('');
        }, 150);
      } else if (next === firstPin) {
        submit(next);
      } else {
        setTimeout(() => {
          setError(t('changePin.mismatchError'));
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
      <Card style={styles.card}>
        <View style={styles.iconWrap}>
          <Icon name="key" size={24} color={colors.turquoise} />
        </View>

        <View style={styles.progressRow}>
          {STAGES.map((s, i) => (
            <View key={s} style={[styles.progressSegment, i <= stepIndex && styles.progressSegmentDone]} />
          ))}
        </View>
        <Text style={styles.progressLabel}>{t('changePin.stepLabel', { current: stepIndex + 1, total: STAGES.length })}</Text>

        <Text style={styles.title}>
          {stage === 'current' ? t('changePin.titleCurrent') : stage === 'enter' ? t('changePin.titleNew') : t('changePin.titleConfirm')}
        </Text>
        <Text style={styles.subtitle}>
          {stage === 'current'
            ? t('changePin.subtitleCurrent')
            : stage === 'enter'
            ? t('changePin.subtitleCreate')
            : t('changePin.subtitleConfirm')}
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
            <Text style={styles.successText}>{t('changePin.successText')}</Text>
          </View>
        ) : null}

        <PinDots length={pin.length} minSlots={PIN_LENGTH} />

        <PinKeypad onDigit={onDigit} onBackspace={onBackspace} disabled={loading || success} />
      </Card>

      {stage === 'current' && (
        <Pressable
          onPress={() => navigation.navigate('ForgotAccessPhone', { type: 'pin' })}
          style={styles.forgotLink}
        >
          <Text style={styles.forgotLinkText}>{t('changePin.forgotPin')}</Text>
        </Pressable>
      )}

      <View style={styles.securityNote}>
        <Icon name="shield-halved" size={13} color={colors.textMuted} />
        <Text style={styles.securityNoteText}>{t('changePin.securityNote')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24, paddingTop: 24 },
  card: { alignItems: 'stretch', paddingVertical: 24 },
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
  forgotLink: {
    alignSelf: 'center',
    marginTop: 16,
  },
  forgotLinkText: {
    color: colors.turquoise,
    fontSize: 12.5,
    fontWeight: '600',
  },
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
