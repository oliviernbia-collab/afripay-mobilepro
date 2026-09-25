import React, { useState } from 'react';
import { Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import Card from '../../components/Card';
import colors from '../../theme/colors';
import { requestMerchantResetOtp } from '../../api/auth';
import { extractErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

// Étape 1 de "code PIN / mot de passe oublié(s)" (route.params.type: 'pin' | 'password').
// Pour le PIN, le marchand est déjà connecté (venu de Paramètres > Changer mon code PIN) : son
// numéro est donc connu et non modifiable, ce qui empêche de réinitialiser le PIN d'un autre
// compte que celui ouvert. Pour le mot de passe, l'écran est ouvert depuis Login (pas de session),
// le numéro est donc saisi librement.
export default function ForgotAccessPhoneScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { type } = route.params;
  const { merchant } = useAuth();
  const isPin = type === 'pin';
  const [telephone, setTelephone] = useState(isPin ? merchant?.telephone || '' : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    if (!telephone.trim()) {
      setError(t('forgotAccess.missingPhone'));
      return;
    }
    setLoading(true);
    try {
      const result = await requestMerchantResetOtp(telephone.trim(), type);
      navigation.navigate('ForgotAccessReset', { type, telephone: telephone.trim(), devCode: result.devCode });
    } catch (e) {
      setError(extractErrorMessage(e, t('forgotAccess.otpError')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Card style={styles.card}>
          <Text style={styles.title}>{isPin ? t('forgotAccess.titlePin') : t('forgotAccess.titlePassword')}</Text>
          <Text style={styles.subtitle}>{isPin ? t('forgotAccess.subtitlePin') : t('forgotAccess.subtitlePassword')}</Text>

          <Input
            label={t('forgotAccess.phoneLabel')}
            placeholder={t('forgotAccess.phonePlaceholder')}
            keyboardType="phone-pad"
            autoCapitalize="none"
            value={telephone}
            onChangeText={setTelephone}
            editable={!isPin}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <GradientButton title={t('forgotAccess.sendCode')} onPress={onSubmit} loading={loading} style={{ marginTop: 8 }} />
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  card: { paddingVertical: 20 },
  title: { color: colors.text, fontSize: 20, fontWeight: '700' },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 6, marginBottom: 20, lineHeight: 19 },
  errorText: { color: colors.error, fontSize: 13, marginTop: 12, textAlign: 'center' },
});
