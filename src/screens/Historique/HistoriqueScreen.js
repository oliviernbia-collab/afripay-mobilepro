import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '../../components/Icon';
import colors, { radii } from '../../theme/colors';
import Card from '../../components/Card';
import TxTypeIcon from '../../components/TxTypeIcon';
import { TransactionStatusBadge } from '../../components/StatusBadge';
import { getMyHistory, getMyStats, getMyWallet } from '../../api/wallet';
import { formatFcfa, formatDateTime } from '../../utils/format';
import { extractErrorMessage } from '../../api/client';

const PERIODS = [
  { value: 'jour', label: "Aujourd'hui" },
  { value: 'semaine', label: 'Cette semaine' },
  { value: 'mois', label: 'Ce mois' },
];

const TYPE_FILTERS = [
  { value: undefined, label: 'Tous' },
  { value: 'achat', label: 'Encaissements' },
  { value: 'transfert', label: 'Transferts' },
  { value: 'recharge', label: 'Recharges' },
];

export default function HistoriqueScreen({ navigation }) {
  const [walletId, setWalletId] = useState(null);
  const [period, setPeriod] = useState('jour');
  const [typeFilter, setTypeFilter] = useState(undefined);
  const [stats, setStats] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const wallet = await getMyWallet();
      setWalletId(wallet.id);
      const [history, statsData] = await Promise.all([
        getMyHistory({ type: typeFilter, limit: 50 }),
        getMyStats(period),
      ]);
      setTransactions(history);
      setStats(statsData);
    } catch (e) {
      setError(extractErrorMessage(e, "Impossible de charger l'historique."));
    }
  }, [typeFilter, period]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const totalPeriod = stats.reduce((sum, s) => sum + Number(s.total || 0), 0);
  const countPeriod = stats.reduce((sum, s) => sum + Number(s.nombre || 0), 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historique</Text>
        <TouchableOpacity
          onPress={() =>
            Alert.alert('Export', 'Bientôt disponible — l\'export CSV/PDF sera ajouté dans une prochaine version.')
          }
        >
          <Icon name="download" size={22} color={colors.blue} />
        </TouchableOpacity>
      </View>

      <View style={styles.periodRow}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.value}
            style={[styles.periodChip, period === p.value && styles.periodChipActive]}
            onPress={() => setPeriod(p.value)}
          >
            <Text style={[styles.periodChipText, period === p.value && styles.periodChipTextActive]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Card style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View>
            <Text style={styles.statsLabel}>Total encaissé</Text>
            <Text style={styles.statsValue}>{formatFcfa(totalPeriod)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.statsLabel}>Transactions</Text>
            <Text style={styles.statsValue}>{countPeriod}</Text>
          </View>
        </View>
      </Card>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.magenta} />}
        ListHeaderComponent={
          <View style={styles.filterRow}>
            {TYPE_FILTERS.map((f) => (
              <TouchableOpacity
                key={f.label}
                style={[styles.filterChip, typeFilter === f.value && styles.filterChipActive]}
                onPress={() => setTypeFilter(f.value)}
              >
                <Text style={[styles.filterChipText, typeFilter === f.value && styles.filterChipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>{error || 'Aucune transaction trouvée.'}</Text>
            </Card>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('TransactionDetail', { transaction: item, walletId })}>
            <Card style={styles.txCard}>
              <View style={styles.txRow}>
                <TxTypeIcon type={item.type} />
                <View style={[styles.txLeft, { marginLeft: 12 }]}>
                  <Text style={styles.txLibelle} numberOfLines={1}>
                    {item.libelle || item.type}
                  </Text>
                  <Text style={styles.txDate}>{formatDateTime(item.date_heure)}</Text>
                </View>
                <View style={styles.txRight}>
                  <Text
                    style={[
                      styles.txAmount,
                      { color: item.wallet_destination_id === walletId ? colors.success : colors.text },
                    ]}
                  >
                    {item.wallet_destination_id === walletId ? '+' : '-'}
                    {formatFcfa(item.montant)}
                  </Text>
                  <TransactionStatusBadge statut={item.statut} />
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  periodRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginTop: 16 },
  periodChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  periodChipActive: { backgroundColor: colors.blue, borderColor: colors.blue },
  periodChipText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  periodChipTextActive: { color: colors.text },
  statsCard: { marginHorizontal: 20, marginTop: 14 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statsLabel: { color: colors.textMuted, fontSize: 11 },
  statsValue: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 4 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 16 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  filterChip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filterChipActive: { borderColor: colors.magenta, backgroundColor: `${colors.magenta}22` },
  filterChipText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: colors.text },
  emptyCard: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
  txCard: { marginBottom: 10 },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  txLeft: { flex: 1, marginRight: 8 },
  txLibelle: { color: colors.text, fontSize: 14, fontWeight: '600' },
  txDate: { color: colors.textMuted, fontSize: 11, marginTop: 3 },
  txRight: { alignItems: 'flex-end', gap: 6 },
  txAmount: { fontSize: 14, fontWeight: '700' },
});
