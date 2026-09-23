import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import PinDots from '../../components/PinDots';
import PinKeypad from '../../components/PinKeypad';
import GradientButton from '../../components/GradientButton';
import colors from '../../theme/colors';
import { setMerchantPin } from '../../api/auth';
import { extractErrorMessage } from '../../api/client';

const PIN_LENGTH = 4;

export default function SetPinScreen({ navigation }) {
  const { t } = useTranslation();
  const [stage, setStage] = useState('enter'); // 'enter' | 'confirm'
  const [firstPin, setFirstPin] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const finish = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  const submit = async (confirmedPin) => {
    setLoading(true);
    try {
      await setMerchantPin(confirmedPin);
      finish();
    } catch (e) {
      setError(extractErrorMessage(e, t('auth.setPin.saveError')));
      setStage('enter');
      setFirstPin('');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const onDigit = (d) => {
    if (loading || pin.length >= PIN_LENGTH) return;
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
          setError(t('auth.setPin.mismatchError'));
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
      <Text style={styles.title}>
        {stage === 'enter' ? t('auth.setPin.titleCreate') : t('auth.setPin.titleConfirm')}
      </Text>
      <Text style={styles.subtitle}>
        {stage === 'enter' ? t('auth.setPin.subtitleCreate') : t('auth.setPin.subtitleConfirm')}
      </Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <PinDots length={pin.length} minSlots={PIN_LENGTH} />

      <PinKeypad onDigit={onDigit} onBackspace={onBackspace} disabled={loading} />

      <GradientButton title={t('auth.setPin.later')} onPress={finish} variant="ghost" style={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
});
