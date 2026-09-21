import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '../../components/Icon';
import colors, { radii } from '../../theme/colors';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import { useAuth } from '../../context/AuthContext';
import { formatFcfa } from '../../utils/format';

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 25000];

export default function AmountScreen({ navigation }) {
  const { isKybValidated } = useAuth();
  const [montant, setMontant] = useState('');
  const [error, setError] = useState('');

  const handleContinue = () => {
    const value = Number(montant);
    if (!value || value <= 0) {
      setError('Veuillez saisir un montant valide.');
      return;
    }
    navigation.navigate('EncaisserScan', { montant: value });
  };

  if (!isKybValidated) {
    return (
      <View style={styles.blockedContainer}>
        <Icon name="lock" size={48} color={colors.warning} />
        <Text style={styles.blockedTitle}>Compte en attente de validation</Text>
        <Text style={styles.blockedText}>
          Vous pourrez encaisser dès que votre dossier sera validé. Complétez votre dossier KYB pour
          accélérer la vérification.
        </Text>
        <GradientButton title="Compléter mon dossier KYB" onPress={() => navigation.navigate('Kyb')} style={{ marginTop: 24, width: '100%' }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Montant à encaisser</Text>
      <Text style={styles.subtitle}>Saisissez le montant que le client doit payer.</Text>

      <Input
        placeholder="0"
        keyboardType="number-pad"
        value={montant}
        onChangeText={(v) => setMontant(v.replace(/[^0-9]/g, ''))}
        containerStyle={{ marginTop: 12 }}
        style={styles.amountInput}
      />
      <Text style={styles.currencyHint}>FCFA</Text>

      <View style={styles.quickRow}>
        {QUICK_AMOUNTS.map((amt) => (
          <TouchableOpacity key={amt} style={styles.quickChip} onPress={() => setMontant(String(amt))}>
            <Text style={styles.quickChipText}>{formatFcfa(amt)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <GradientButton
        title="Scanner le paiement du client"
        onPress={handleContinue}
        style={{ marginTop: 20 }}
        icon={<Icon name="qrcode" size={18} color={colors.text} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24, paddingTop: 20 },
  title: { color: colors.text, fontSize: 20, fontWeight: '700' },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 6 },
  amountInput: { fontSize: 28, fontWeight: '800' },
  currencyHint: { color: colors.textMuted, fontSize: 12, marginTop: -12, marginBottom: 20 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  quickChip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  quickChipText: { color: colors.textSecondary, fontSize: 12.5, fontWeight: '600' },
  errorText: { color: colors.error, fontSize: 13, marginTop: 12, textAlign: 'center' },
  blockedContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  blockedTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 16, textAlign: 'center' },
  blockedText: { color: colors.textSecondary, fontSize: 13, marginTop: 10, textAlign: 'center', lineHeight: 19 },
});
