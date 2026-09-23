import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon';
import colors from '../../theme/colors';
import Card from '../../components/Card';
import { TransactionStatusBadge } from '../../components/StatusBadge';
import { formatFcfa, formatDateTime } from '../../utils/format';

export default function TransactionDetailScreen({ route }) {
  const { t } = useTranslation();
  const { transaction, walletId } = route.params;
  const isCredit = transaction.wallet_destination_id === walletId;

  const TYPE_LABELS = {
    achat: t('txType.achat'),
    transfert: t('txType.transfert'),
    recharge: t('txType.recharge'),
  };
  const METHOD_LABELS = {
    paume_de_main: t('txMethod.paume_de_main'),
    mobile_money: t('txMethod.mobile_money'),
    carte_visa: t('txMethod.carte_visa'),
    interne: t('txMethod.interne'),
  };
  const statutLabel = t(`status.tx.${transaction.statut}`, { defaultValue: transaction.statut });

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
        <Row label={t('historiqueDetail.typeLabel')} value={TYPE_LABELS[transaction.type] || transaction.type} />
        <Row
          label={t('historiqueDetail.methodLabel')}
          value={METHOD_LABELS[transaction['méthode']] || transaction['méthode'] || '—'}
        />
        {transaction.contrepartie?.telephone ? (
          <Row label={t('historiqueDetail.numberLabel')} value={transaction.contrepartie.telephone} />
        ) : null}
        <Row label={t('historiqueDetail.libelleLabel')} value={transaction.libelle || '—'} />
        <Row label={t('historiqueDetail.referenceLabel')} value={transaction.reference} />
        <Row label={t('historiqueDetail.dateLabel')} value={formatDateTime(transaction.date_heure)} />
        {Number(transaction.frais) > 0 ? <Row label={t('historiqueDetail.feesLabel')} value={formatFcfa(transaction.frais)} /> : null}
        <Row label={t('historiqueDetail.statusLabel')} value={statutLabel} last />
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
