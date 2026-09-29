import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon';
import colors, { txTypeLabel, txMethodLabel, statutLabel as statutLabelFn, providerLabel } from '../../theme/colors';
import Card from '../../components/Card';
import { TransactionStatusBadge } from '../../components/StatusBadge';
import { formatFcfa, formatDateTime } from '../../utils/format';

export default function TransactionDetailScreen({ route }) {
  const { t } = useTranslation();
  const { transaction, walletId } = route.params;
  const isCredit = transaction.wallet_destination_id === walletId;
  const statutLabel = statutLabelFn(transaction.statut, t);

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
        <Row label={t('historiqueDetail.typeLabel')} value={txTypeLabel(transaction.type, t)} />
        <Row label={t('historiqueDetail.methodLabel')} value={txMethodLabel(transaction['méthode'], t)} />
        {transaction.contrepartie?.telephone ? (
          <Row label={t('historiqueDetail.numberLabel')} value={transaction.contrepartie.telephone} />
        ) : null}
        {transaction.contrepartie?.fournisseur ? (
          <Row label={t('historiqueDetail.providerLabel')} value={providerLabel(transaction.contrepartie.fournisseur, t)} />
        ) : null}
        {/* Le libellé d'un virement interne est un texte libre saisi par l'expéditeur (affiché tel
            quel, ce n'est pas un rendu serveur traduit) ; pour achat/recharge/virement externe,
            `libelle` est un texte déjà traduit et figé — l'info équivalente est déjà reconstruite
            ci-dessus (contrepartie/fournisseur), donc pas de repli sur ce texte frozen ici. */}
        {transaction.type === 'transfert' && !transaction.contrepartie?.externe ? (
          <Row label={t('historiqueDetail.libelleLabel')} value={transaction.libelle || '—'} />
        ) : null}
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
