import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import BrandHeader from '../../components/BrandHeader';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import Card from '../../components/Card';
import colors from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../api/client';

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [telephone, setTelephone] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!telephone || !motDePasse) {
      setError(t('auth.login.missingFields'));
      return;
    }
    setLoading(true);
    try {
      await login({ telephone, motDePasse });
    } catch (e) {
      setError(extractErrorMessage(e, t('auth.login.error')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.langRow}>
          <LanguageSwitcher />
        </View>

        <View style={styles.header}>
          <BrandHeader size="main" showTagline />
        </View>

        <Card style={styles.card}>
          <Text style={styles.title}>{t('auth.login.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.login.subtitle')}</Text>

          <View style={styles.form}>
            <Input
              label={t('auth.login.phoneLabel')}
              placeholder={t('auth.login.phonePlaceholder')}
              keyboardType="phone-pad"
              autoCapitalize="none"
              value={telephone}
              onChangeText={setTelephone}
            />
            <Input
              label={t('auth.login.passwordLabel')}
              placeholder="••••••••"
              secureTextEntry
              autoCapitalize="none"
              value={motDePasse}
              onChangeText={setMotDePasse}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotAccessPhone', { type: 'password' })}
              style={styles.forgotLink}
            >
              <Text style={styles.forgotLinkText}>{t('auth.login.forgotPassword')}</Text>
            </TouchableOpacity>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <GradientButton title={t('auth.login.submit')} onPress={handleLogin} loading={loading} style={styles.submitBtn} />

            <TouchableOpacity onPress={() => navigation.navigate('RegisterType')} style={styles.registerLink}>
              <Text style={styles.registerText}>
                {t('auth.login.noAccount')} <Text style={styles.registerTextStrong}>{t('auth.login.createAccount')}</Text>
              </Text>
            </TouchableOpacity>
          </View>
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
  langRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  header: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  card: {
    paddingVertical: 20,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  form: {
    marginTop: 4,
  },
  submitBtn: {
    marginTop: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotLinkText: {
    color: colors.turquoise,
    fontSize: 12.5,
    fontWeight: '600',
  },
  registerLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  registerText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  registerTextStrong: {
    color: colors.turquoise,
    fontWeight: '700',
  },
});
