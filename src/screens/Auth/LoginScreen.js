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
import BrandHeader from '../../components/BrandHeader';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import colors from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../api/client';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [telephone, setTelephone] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!telephone || !motDePasse) {
      setError('Veuillez renseigner votre téléphone et votre mot de passe.');
      return;
    }
    setLoading(true);
    try {
      await login({ telephone, motDePasse });
    } catch (e) {
      setError(extractErrorMessage(e, 'Connexion impossible. Vérifiez vos identifiants.'));
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
        <View style={styles.header}>
          <BrandHeader size="main" showTagline />
        </View>

        <Text style={styles.title}>Espace Marchand</Text>
        <Text style={styles.subtitle}>Connectez-vous pour encaisser vos ventes AfriPay.</Text>

        <View style={styles.form}>
          <Input
            label="Téléphone"
            placeholder="Ex: 0700000000"
            keyboardType="phone-pad"
            autoCapitalize="none"
            value={telephone}
            onChangeText={setTelephone}
          />
          <Input
            label="Mot de passe"
            placeholder="••••••••"
            secureTextEntry
            autoCapitalize="none"
            value={motDePasse}
            onChangeText={setMotDePasse}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <GradientButton title="Se connecter" onPress={handleLogin} loading={loading} style={styles.submitBtn} />

          <TouchableOpacity onPress={() => navigation.navigate('RegisterType')} style={styles.registerLink}>
            <Text style={styles.registerText}>
              Pas encore de compte marchand ? <Text style={styles.registerTextStrong}>Créer un compte</Text>
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
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
    marginBottom: 28,
  },
  form: {
    marginTop: 8,
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
