import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import colors from '../../theme/colors';
import { setMerchantPin } from '../../api/auth';
import { extractErrorMessage } from '../../api/client';

export default function SetPinScreen({ navigation }) {
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const finish = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

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
      finish();
    } catch (e) {
      setError(extractErrorMessage(e, 'Impossible de définir le code PIN.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Définissez votre code PIN AfriPay</Text>
      <Text style={styles.subtitle}>
        Ce code (4 à 6 chiffres) vous sera demandé pour confirmer les transferts à partir de 50 000 FCFA.
      </Text>

      <Input label="Code PIN" placeholder="••••" secureTextEntry keyboardType="number-pad" maxLength={6} value={pin} onChangeText={setPin} />
      <Input label="Confirmer le code PIN" placeholder="••••" secureTextEntry keyboardType="number-pad" maxLength={6} value={pinConfirm} onChangeText={setPinConfirm} />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <GradientButton title="Valider" onPress={handleSubmit} loading={loading} />
      <GradientButton title="Configurer plus tard" onPress={finish} variant="ghost" style={{ marginTop: 12 }} />
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
    marginBottom: 22,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
});
