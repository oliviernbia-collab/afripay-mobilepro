import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import Card from '../../components/Card';
import colors, { radii } from '../../theme/colors';
import { useToast } from '../../context/ToastContext';
import { resetMerchantPin, resetMerchantPassword } from '../../api/auth';
import { extractErrorMessage } from '../../api/client';

// Étape 2 : code reçu par SMS + nouveau secret. Le mot de passe réinitialisé révoque aussi
// toutes les sessions actives côté backend, l'utilisateur doit donc se reconnecter — d'où le
// retour à l'écran de connexion plutôt qu'une reconnexion automatique. Le PIN réinitialisé, lui,
// ne casse pas la session en cours : on revient simplement à l'écran d'où la demande est partie.
export default function ForgotAccessResetScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { showSuccess } = useToast();
  const { type, telephone, devCode } = route.params;
  const isPin = type === 'pin';
  const [otp, setOtp] = useState('');
  const [secret, setSecret] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    if (!otp.trim()) {
      setError(t('forgotAccess.missingCode'));
      return;
    }
    if (isPin ? !/^\d{4,6}$/.test(secret) : secret.length < 6) {
      setError(isPin ? t('forgotAccess.pinInvalid') : t('forgotAccess.passwordTooShort'));
      return;
    }
    if (secret !== confirmation) {
      setError(t('forgotAccess.mismatch'));
      return;
    }
    setLoading(true);
    try {
      if (isPin) {
        await resetMerchantPin(telephone, otp.trim(), secret);
        showSuccess(t('forgotAccess.successTextPin'));
        // Revient à Paramètres (Paramètres -> ChangePin -> ForgotAccessPhone -> ici) plutôt
        // qu'à l'étape "PIN actuel" de ChangePin, désormais sans objet puisque le PIN vient
        // d'être remplacé par cette réinitialisation.
        navigation.pop(3);
      } else {
        await resetMerchantPassword(telephone, otp.trim(), secret);
        showSuccess(t('forgotAccess.successTextPassword'));
        navigation.navigate('Login');
      }
    } catch (e) {
      setError(extractErrorMessage(e, t('forgotAccess.error')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Card style={styles.card}>
          <Text style={styles.title}>{isPin ? t('forgotAccess.resetTitlePin') : t('forgotAccess.resetTitlePassword')}</Text>
          <Text style={styles.subtitle}>{t('forgotAccess.resetSubtitle', { phone: telephone })}</Text>

          {devCode ? (
            <View style={styles.devHint}>
              <Text style={styles.devHintTitle}>{t('auth.otp.devTitle')}</Text>
              <Text style={styles.devHintText}>{t('auth.otp.devText', { code: devCode })}</Text>
            </View>
          ) : null}

          <Input
            label={t('forgotAccess.codeLabel')}
            placeholder="123456"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
          />
          <Input
            label={isPin ? t('forgotAccess.newPinLabel') : t('forgotAccess.newPasswordLabel')}
            placeholder={isPin ? '••••' : t('forgotAccess.newPasswordPlaceholder')}
            keyboardType={isPin ? 'number-pad' : 'default'}
            secureTextEntry
            maxLength={isPin ? 6 : undefined}
            value={secret}
            onChangeText={setSecret}
          />
          <Input
            label={t('forgotAccess.confirmLabel')}
            placeholder={isPin ? '••••' : '••••••••'}
            keyboardType={isPin ? 'number-pad' : 'default'}
            secureTextEntry
            maxLength={isPin ? 6 : undefined}
            value={confirmation}
            onChangeText={setConfirmation}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <GradientButton title={t('forgotAccess.submit')} onPress={onSubmit} loading={loading} style={{ marginTop: 8 }} />
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
  subtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 6, marginBottom: 16, lineHeight: 19 },
  devHint: {
    backgroundColor: `${colors.gold}18`,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: radii.md,
    padding: 12,
    marginBottom: 16,
  },
  devHintTitle: { color: colors.gold, fontWeight: '700', marginBottom: 4, fontSize: 12 },
  devHintText: { color: colors.text, fontSize: 13 },
  errorText: { color: colors.error, fontSize: 13, marginTop: 12, textAlign: 'center' },
});
