import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from '../../components/Icon';
import colors, { radii } from '../../theme/colors';
import Card from '../../components/Card';
import GradientButton from '../../components/GradientButton';
import { formatFcfa, formatDateTime } from '../../utils/format';

export default function ReceiptScreen({ route, navigation }) {
  const { success, montant, result, errorMessage } = route.params;

  const goDashboard = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  const retry = () => {
    navigation.replace('EncaisserScan', { montant });
  };

  if (success) {
    const { client, reçu, transaction } = result;
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.checkWrap}>
          <Icon name="circle-check" size={88} color={colors.success} />
        </View>
        <Text style={styles.successTitle}>Paiement accepté</Text>
        <Text style={styles.successAmount}>{formatFcfa(reçu?.montant ?? montant)}</Text>

        <Card style={styles.receiptCard}>
          <Row label="Client" value={`${client?.prenom || ''} ${client?.nom || ''}`.trim() || '—'} />
          <Row label="Référence" value={reçu?.reference || transaction?.reference || '—'} />
          <Row label="Date & heure" value={formatDateTime(reçu?.date || transaction?.date_heure)} />
          <Row label="Méthode" value="Scan de paiement AfriPay" last />
        </Card>

        <GradientButton title="Nouvel encaissement" onPress={() => navigation.replace('EncaisserAmount')} style={{ marginTop: 24 }} />
        <GradientButton title="Retour au tableau de bord" onPress={goDashboard} variant="ghost" style={{ marginTop: 8 }} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.checkWrap}>
        <Icon name="circle-xmark" size={88} color={colors.error} />
      </View>
      <Text style={styles.failTitle}>Paiement refusé</Text>
      <Text style={styles.failMessage}>{errorMessage}</Text>

      <Card style={styles.receiptCard}>
        <Row label="Montant demandé" value={formatFcfa(montant)} last />
      </Card>

      <GradientButton title="Réessayer le scan" onPress={retry} style={{ marginTop: 24 }} />
      <GradientButton title="Modifier le montant" onPress={() => navigation.replace('EncaisserAmount')} variant="secondary" style={{ marginTop: 12 }} />
      <GradientButton title="Retour au tableau de bord" onPress={goDashboard} variant="ghost" style={{ marginTop: 8 }} />
    </ScrollView>
  );
}

function Row({ label, value, last }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: 'center',
  },
  checkWrap: { marginBottom: 12 },
  successTitle: { color: colors.success, fontSize: 20, fontWeight: '800' },
  successAmount: { color: colors.text, fontSize: 30, fontWeight: '800', marginTop: 6 },
  failTitle: { color: colors.error, fontSize: 20, fontWeight: '800' },
  failMessage: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  receiptCard: { width: '100%', marginTop: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { color: colors.textMuted, fontSize: 13 },
  rowValue: { color: colors.text, fontSize: 13, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
});
