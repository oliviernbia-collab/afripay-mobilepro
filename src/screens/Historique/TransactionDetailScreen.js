import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from '../../components/Icon';
import colors from '../../theme/colors';
import Card from '../../components/Card';
import { TransactionStatusBadge } from '../../components/StatusBadge';
import { formatFcfa, formatDateTime } from '../../utils/format';

const TYPE_LABELS = { achat: 'Encaissement', transfert: 'Transfert', recharge: 'Recharge' };
const METHOD_LABELS = {
  paume_de_main: 'Scan de paiement AfriPay',
  mobile_money: 'Mobile Money',
  carte_visa: 'Carte Visa',
  interne: 'Transfert interne AfriPay',
};

export default function TransactionDetailScreen({ route }) {
  const { transaction, walletId } = route.params;
  const isCredit = transaction.wallet_destination_id === walletId;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.iconWrap}>
        <Icon
          name={isCredit ? 'circle-arrow-down' : 'circle-arrow-up'}
          size={64}
          color={isCredit ? colors.success : colors.magenta}
        />
      </View>
      <Text style={[styles.amount, { color: isCredit ? colors.success : colors.text }]}>
        {isCredit ? '+' : '-'}
        {formatFcfa(transaction.montant)}
      </Text>
      <TransactionStatusBadge statut={transaction.statut} style={{ marginTop: 8 }} />

      <Card style={styles.card}>
        <Row label="Type" value={TYPE_LABELS[transaction.type] || transaction.type} />
        <Row label="Méthode" value={METHOD_LABELS[transaction['méthode']] || transaction['méthode'] || '—'} />
        <Row label="Libellé" value={transaction.libelle || '—'} />
        <Row label="Référence" value={transaction.reference} />
        <Row label="Date & heure" value={formatDateTime(transaction.date_heure)} />
        {Number(transaction.frais) > 0 ? <Row label="Frais" value={formatFcfa(transaction.frais)} /> : null}
        <Row label="Statut" value={transaction.statut} last />
      </Card>
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
  container: { flexGrow: 1, backgroundColor: colors.background, alignItems: 'center', padding: 24 },
  iconWrap: { marginTop: 12, marginBottom: 8 },
  amount: { fontSize: 28, fontWeight: '800' },
  card: { width: '100%', marginTop: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { color: colors.textMuted, fontSize: 13 },
  rowValue: { color: colors.text, fontSize: 13, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
});
