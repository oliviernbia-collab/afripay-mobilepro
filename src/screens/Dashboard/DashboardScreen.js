import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '../../components/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import colors, { gradients, radii } from '../../theme/colors';
import Card from '../../components/Card';
import { KybBadge, TransactionStatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { getMyWallet, getMyHistory, getMyStats } from '../../api/wallet';
import { formatFcfa, formatDateTime } from '../../utils/format';
import { extractErrorMessage } from '../../api/client';
import TxTypeIcon from '../../components/TxTypeIcon';

const todayStr = () => new Date().toISOString().slice(0, 10);

const ACTIONS = [
  { key: 'encaisser', label: 'Encaisser', icon: 'qrcode', color: colors.magenta, route: 'EncaisserAmount' },
  { key: 'transferer', label: 'Transférer', icon: 'right-left', color: colors.blue, route: 'Transferer' },
  { key: 'historique', label: 'Historique', icon: 'clock-rotate-left', color: colors.turquoise, route: 'Historique' },
];

export default function DashboardScreen({ navigation }) {
  const { merchant, isKybValidated, refreshMerchant } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [todayEncaisse, setTodayEncaisse] = useState(0);
  const [todayTransfere, setTodayTransfere] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [balanceHidden, setBalanceHidden] = useState(false);

  const loadData = useCallback(async () => {
    setError('');
    try {
      const today = todayStr();
      const [w, h, stats, transfersToday] = await Promise.all([
        getMyWallet(),
        getMyHistory({ limit: 5 }),
        getMyStats('jour'),
        getMyHistory({ type: 'transfert', dateDebut: today, dateFin: today, limit: 200 }),
        refreshMerchant(),
      ]);
      setWallet(w);
      setTransactions(h);
      setTodayEncaisse(stats.reduce((sum, s) => sum + Number(s.total || 0), 0));
      setTodayTransfere(transfersToday.reduce((sum, t) => sum + Number(t.montant || 0), 0));
    } catch (e) {
      setError(extractErrorMessage(e, 'Impossible de charger votre tableau de bord.'));
    }
  }, [refreshMerchant]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData().finally(() => setLoading(false));
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.magenta} />}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Icon name="store" size={20} color={colors.text} />
        </View>
        <View style={styles.greetingTextWrap}>
          <Text style={styles.greeting} numberOfLines={1}>
            Bonjour{merchant?.raison_sociale ? `, ${merchant.raison_sociale}` : ''}
          </Text>
          <Text style={styles.greetingSub}>Marchand</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.bellBtn}>
          <Icon name="bell" size={18} color={colors.turquoise} />
        </TouchableOpacity>
      </View>

      {!isKybValidated ? (
        <TouchableOpacity onPress={() => navigation.navigate('Kyb')} activeOpacity={0.85}>
          <View style={styles.kybBanner}>
            <Icon name="triangle-exclamation" size={20} color={colors.warning} />
            <Text style={styles.kybBannerText}>
              Compte en attente de validation — vous pourrez encaisser dès que votre dossier sera validé.
              Appuyez pour compléter votre dossier KYB.
            </Text>
            <Icon name="chevron-right" size={18} color={colors.warning} />
          </View>
        </TouchableOpacity>
      ) : null}

      <LinearGradient colors={gradients.balance} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <View style={styles.balanceLabelRow}>
            <View style={styles.balanceIconWrap}>
              <Icon name="wallet" size={13} color={colors.text} />
            </View>
            <Text style={styles.balanceLabel}>Solde disponible</Text>
            <TouchableOpacity onPress={() => setBalanceHidden((v) => !v)} hitSlop={10}>
              <Icon name={balanceHidden ? 'eye-slash' : 'eye'} size={15} color="rgba(255,255,255,0.75)" />
            </TouchableOpacity>
          </View>
          <KybBadge statut={merchant?.statut_kyb} dark />
        </View>
        <Text style={styles.balanceAmount}>
          {loading ? '···' : balanceHidden ? '•••••• FCFA' : formatFcfa(wallet?.solde)}
        </Text>
        <Text style={styles.balanceSub}>Portefeuille AfriPay Marchand</Text>
      </LinearGradient>

      <View style={styles.todayRow}>
        <Text style={styles.todayTitle}>Aujourd&apos;hui</Text>
        <View style={styles.todayStatsRow}>
          <View style={styles.todayStat}>
            <Text style={styles.todayStatLabel}>Encaissements</Text>
            <Text style={styles.todayStatValue}>{formatFcfa(todayEncaisse)}</Text>
          </View>
          <View style={styles.todayStat}>
            <Text style={styles.todayStatLabel}>Transferts</Text>
            <Text style={styles.todayStatValue}>{formatFcfa(todayTransfere)}</Text>
          </View>
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.actionsRow}>
        {ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.key}
            style={styles.actionBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate(action.route)}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${action.color}22` }]}>
              <Icon name={action.icon} size={26} color={action.color} />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Transactions récentes</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Historique')}>
          <Text style={styles.sectionLink}>Voir tout</Text>
        </TouchableOpacity>
      </View>

      {transactions.length === 0 && !loading ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>Aucune transaction pour le moment.</Text>
        </Card>
      ) : (
        transactions.map((tx) => (
          <Card key={tx.id} style={styles.txCard}>
            <View style={styles.txRow}>
              <TxTypeIcon type={tx.type} />
              <View style={[styles.txLeft, { marginLeft: 12 }]}>
                <Text style={styles.txLibelle} numberOfLines={1}>
                  {tx.libelle || tx.type}
                </Text>
                <Text style={styles.txDate}>{formatDateTime(tx.date_heure)}</Text>
              </View>
              <View style={styles.txRight}>
                <Text
                  style={[
                    styles.txAmount,
                    { color: tx.wallet_destination_id === wallet?.id ? colors.success : colors.text },
                  ]}
                >
                  {tx.wallet_destination_id === wallet?.id ? '+' : '-'}
                  {formatFcfa(tx.montant)}
                </Text>
                <TransactionStatusBadge statut={tx.statut} />
              </View>
            </View>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: `${colors.turquoise}22`,
    borderWidth: 1,
    borderColor: colors.turquoise,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: colors.violet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingTextWrap: { flex: 1, marginHorizontal: 12 },
  greeting: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  greetingSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  kybBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: `${colors.warning}1A`,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: radii.md,
    padding: 12,
    marginBottom: 16,
  },
  kybBannerText: {
    flex: 1,
    color: colors.text,
    fontSize: 12.5,
    lineHeight: 18,
  },
  balanceCard: {
    borderRadius: radii.xl,
    padding: 20,
    marginBottom: 20,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  balanceIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
    fontSize: 13,
  },
  balanceAmount: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    marginTop: 10,
  },
  balanceSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  todayRow: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 20,
  },
  todayTitle: { color: colors.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 10 },
  todayStatsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  todayStat: { flex: 1 },
  todayStatLabel: { color: colors.textSecondary, fontSize: 12 },
  todayStatValue: { color: colors.text, fontSize: 17, fontWeight: '800', marginTop: 4 },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  actionBtn: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    color: colors.text,
    fontSize: 12.5,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionLink: {
    color: colors.blue,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  txCard: {
    marginBottom: 10,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txLeft: {
    flex: 1,
    marginRight: 8,
  },
  txLibelle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  txDate: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 3,
  },
  txRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
});
