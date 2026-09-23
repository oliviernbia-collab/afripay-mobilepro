import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import colors, { radii } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { requestMerchantOtp } from '../../api/auth';
import { extractErrorMessage } from '../../api/client';

export default function OtpScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { devCode, registerPayload } = route.params;
  const { register } = useAuth();

  const [otp, setOtp] = useState(devCode || '');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [currentDevCode, setCurrentDevCode] = useState(devCode);

  const handleVerify = async () => {
    setError('');
    if (!otp) {
      setError(t('auth.otp.missingCode'));
      return;
    }
    setLoading(true);
    try {
      await register({ ...registerPayload, otp });
      navigation.reset({ index: 0, routes: [{ name: 'SetPin' }] });
    } catch (e) {
      setError(extractErrorMessage(e, t('auth.otp.invalidCode')));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setResending(true);
    try {
      const result = await requestMerchantOtp(registerPayload.telephone);
      setCurrentDevCode(result.devCode);
      if (result.devCode) setOtp(result.devCode);
    } catch (e) {
      setError(extractErrorMessage(e, t('auth.otp.resendError')));
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.otp.title')}</Text>
      <Text style={styles.subtitle}>{t('auth.otp.subtitle', { phone: registerPayload.telephone })}</Text>

      {currentDevCode ? (
        <View style={styles.devBanner}>
          <Text style={styles.devBannerTitle}>{t('auth.otp.devTitle')}</Text>
          <Text style={styles.devBannerText}>{t('auth.otp.devText', { code: currentDevCode })}</Text>
        </View>
      ) : null}

      <Input
        label={t('auth.otp.codeLabel')}
        placeholder="123456"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <GradientButton title={t('auth.otp.verify')} onPress={handleVerify} loading={loading} />
      <GradientButton
        title={t('auth.otp.resend')}
        onPress={handleResend}
        loading={resending}
        variant="ghost"
        style={{ marginTop: 12 }}
      />
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
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 6,
    marginBottom: 20,
  },
  devBanner: {
    backgroundColor: `${colors.gold}1A`,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: radii.md,
    padding: 12,
    marginBottom: 20,
  },
  devBannerTitle: {
    color: colors.gold,
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 4,
  },
  devBannerText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
});
