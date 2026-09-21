import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import colors from '../../theme/colors';
import { setMerchantPin } from '../../api/auth';
import { extractErrorMessage } from '../../api/client';

export default function ChangePinScreen({ navigation }) {
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!/^\d{4,6}$/.test(pin)) {
      setError('Le code PIN doit contenir entre 4 et 6 chiffres.');
      return;
    }
    if (pin !== pinConfirm) {
      setError('Les deux codes PIN ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      await setMerchantPin(pin);
      setSuccess(true);
      setTimeout(() => navigation.goBack(), 900);
    } catch (e) {
      setError(extractErrorMessage(e, 'Impossible de mettre à jour le code PIN.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>
        Ce code (4 à 6 chiffres) est demandé pour confirmer les transferts à partir de 50 000 FCFA.
      </Text>

      <Input label="Nouveau code PIN" placeholder="••••" secureTextEntry keyboardType="number-pad" maxLength={6} value={pin} onChangeText={setPin} />
      <Input label="Confirmer le code PIN" placeholder="••••" secureTextEntry keyboardType="number-pad" maxLength={6} value={pinConfirm} onChangeText={setPinConfirm} />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {success ? <Text style={styles.successText}>Code PIN mis à jour.</Text> : null}

      <GradientButton title="Enregistrer" onPress={handleSubmit} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24, paddingTop: 20 },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginBottom: 22, lineHeight: 19 },
  errorText: { color: colors.error, fontSize: 13, marginBottom: 8, textAlign: 'center' },
  successText: { color: colors.success, fontSize: 13, marginBottom: 8, textAlign: 'center', fontWeight: '600' },
});
