import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import colors from '../../theme/colors';
import { requestMerchantOtp } from '../../api/auth';
import { extractErrorMessage } from '../../api/client';

export default function RegisterFormScreen({ route, navigation }) {
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
      setError('Raison sociale et RCCM sont requis pour un compte Entreprise.');
      return;
    }
    if (!telephone) {
      setError('Le numéro de téléphone est requis.');
      return;
    }
    if (!motDePasse || motDePasse.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (motDePasse !== motDePasseConfirm) {
      setError('Les mots de passe ne correspondent pas.');
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
      setError(extractErrorMessage(e, "Impossible d'envoyer le code de vérification."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{isEntreprise ? 'Informations de l\'entreprise' : 'Vos informations'}</Text>
        <Text style={styles.subtitle}>
          {isEntreprise
            ? 'Ces informations seront vérifiées lors de la validation KYB par AfriPay.'
            : "Compte auto-entrepreneur / particulier — parcours simplifié."}
        </Text>

        {isEntreprise ? (
          <>
            <Input label="Raison sociale *" placeholder="Nom de l'entreprise" value={raisonSociale} onChangeText={setRaisonSociale} />
            <Input label="RCCM *" placeholder="Numéro RCCM" value={rccm} onChangeText={setRccm} autoCapitalize="characters" />
            <Input label="NCC / NIF" placeholder="Numéro contribuable (optionnel)" value={ncc} onChangeText={setNcc} autoCapitalize="characters" />
          </>
        ) : null}

        <Input label="Téléphone *" placeholder="Ex: 0700000000" keyboardType="phone-pad" value={telephone} onChangeText={setTelephone} />
        <Input label="Email" placeholder="optionnel@exemple.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <Input label="Mot de passe *" placeholder="Au moins 6 caractères" secureTextEntry value={motDePasse} onChangeText={setMotDePasse} />
        <Input label="Confirmer le mot de passe *" placeholder="••••••••" secureTextEntry value={motDePasseConfirm} onChangeText={setMotDePasseConfirm} />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <GradientButton title="Continuer" onPress={handleContinue} loading={loading} style={{ marginTop: 8 }} />
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
