import React, { useState } from 'react';
import { Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import Card from '../../components/Card';
import colors from '../../theme/colors';
import { requestMerchantOtp } from '../../api/auth';
import { extractErrorMessage } from '../../api/client';

export default function RegisterFormScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { type } = route.params; // 'entreprise' | 'particulier'
  const isEntreprise = type === 'entreprise';

  const [raisonSociale, setRaisonSociale] = useState('');
  const [rccm, setRccm] = useState('');
  const [ncc, setNcc] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [motDePasseConfirm, setMotDePasseConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    setError('');

    if (isEntreprise && (!raisonSociale || !rccm)) {
      setError(t('auth.registerForm.missingEntreprise'));
      return;
    }
    if (!telephone) {
      setError(t('auth.registerForm.missingPhone'));
      return;
    }
    if (!motDePasse || motDePasse.length < 6) {
      setError(t('auth.registerForm.passwordTooShort'));
      return;
    }
    if (motDePasse !== motDePasseConfirm) {
      setError(t('auth.registerForm.passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      const { devCode } = await requestMerchantOtp(telephone);
      navigation.navigate('Otp', {
        devCode,
        registerPayload: {
          type,
          raisonSociale: isEntreprise ? raisonSociale : undefined,
          rccm: isEntreprise ? rccm : undefined,
          ncc: isEntreprise ? ncc : undefined,
          telephone,
          email: email || undefined,
          motDePasse,
        },
      });
    } catch (e) {
      setError(extractErrorMessage(e, t('auth.registerForm.error')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Card style={styles.card}>
          <Text style={styles.title}>
            {isEntreprise ? t('auth.registerForm.titleEntreprise') : t('auth.registerForm.titleParticulier')}
          </Text>
          <Text style={styles.subtitle}>
            {isEntreprise ? t('auth.registerForm.subtitleEntreprise') : t('auth.registerForm.subtitleParticulier')}
          </Text>

          {isEntreprise ? (
            <>
              <Input
                label={t('auth.registerForm.raisonSocialeLabel')}
                placeholder={t('auth.registerForm.raisonSocialePlaceholder')}
                value={raisonSociale}
                onChangeText={setRaisonSociale}
              />
              <Input
                label={t('auth.registerForm.rccmLabel')}
                placeholder={t('auth.registerForm.rccmPlaceholder')}
                value={rccm}
                onChangeText={setRccm}
                autoCapitalize="characters"
              />
              <Input
                label={t('auth.registerForm.nccLabel')}
                placeholder={t('auth.registerForm.nccPlaceholder')}
                value={ncc}
                onChangeText={setNcc}
                autoCapitalize="characters"
              />
            </>
          ) : null}

          <Input
            label={t('auth.registerForm.phoneLabel')}
            placeholder={t('auth.registerForm.phonePlaceholder')}
            keyboardType="phone-pad"
            value={telephone}
            onChangeText={setTelephone}
          />
          <Input
            label={t('auth.registerForm.emailLabel')}
            placeholder={t('auth.registerForm.emailPlaceholder')}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label={t('auth.registerForm.passwordLabel')}
            placeholder={t('auth.registerForm.passwordPlaceholder')}
            secureTextEntry
            value={motDePasse}
            onChangeText={setMotDePasse}
          />
          <Input
            label={t('auth.registerForm.confirmLabel')}
            placeholder="••••••••"
            secureTextEntry
            value={motDePasseConfirm}
            onChangeText={setMotDePasseConfirm}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <GradientButton title={t('auth.registerForm.continue')} onPress={handleContinue} loading={loading} style={{ marginTop: 8 }} />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  card: {
    paddingVertical: 20,
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
    marginBottom: 22,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
});
