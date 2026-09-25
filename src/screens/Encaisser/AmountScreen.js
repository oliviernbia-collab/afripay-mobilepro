import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon';
import colors, { radii } from '../../theme/colors';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import Card from '../../components/Card';
import { useAuth } from '../../context/AuthContext';
import { formatFcfa } from '../../utils/format';

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 25000];

export default function AmountScreen({ navigation }) {
  const { t } = useTranslation();
  const { isKybValidated } = useAuth();
  const [montant, setMontant] = useState('');
  const [error, setError] = useState('');

  const handleContinue = () => {
    const value = Number(montant);
    if (!value || value <= 0) {
      setError(t('encaisser.amount.invalidAmount'));
      return;
    }
    navigation.navigate('EncaisserScan', { montant: value });
  };

  if (!isKybValidated) {
    return (
      <View style={styles.blockedContainer}>
        <Card style={styles.blockedCard}>
          <Icon name="lock" size={48} color={colors.warning} />
          <Text style={styles.blockedTitle}>{t('encaisser.amount.blockedTitle')}</Text>
          <Text style={styles.blockedText}>{t('encaisser.amount.blockedText')}</Text>
          <GradientButton
            title={t('encaisser.amount.completeKyb')}
            onPress={() => navigation.navigate('Kyb')}
            style={{ marginTop: 24, width: '100%' }}
          />
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>{t('encaisser.amount.title')}</Text>
        <Text style={styles.subtitle}>{t('encaisser.amount.subtitle')}</Text>

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
          title={t('encaisser.amount.scanButton')}
          onPress={handleContinue}
          style={{ marginTop: 20 }}
          icon={<Icon name="qrcode" size={18} color={colors.text} />}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24, paddingTop: 20 },
  card: { paddingVertical: 20 },
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
    paddingHorizontal: 24,
  },
  blockedCard: { alignItems: 'center', width: '100%', paddingVertical: 28 },
  blockedTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 16, textAlign: 'center' },
  blockedText: { color: colors.textSecondary, fontSize: 13, marginTop: 10, textAlign: 'center', lineHeight: 19 },
});
