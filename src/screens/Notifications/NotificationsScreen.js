import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon';
import colors, { radii, notificationText } from '../../theme/colors';
import Card from '../../components/Card';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../api/notifications';
import { formatDateTime } from '../../utils/format';
import { extractErrorMessage } from '../../api/client';
import { enqueueMarkRead } from '../../utils/offlineReadQueue';
import { socket } from '../../realtime/socket';
import { useNotificationsBadge } from '../../context/NotificationsContext';

const TYPE_ICONS = {
  transaction: 'money-bill-transfer',
  système: 'circle-info',
  kyc: 'shield-halved',
};

// Même logique que HistoriqueScreen.js — plages calculées côté client, envoyées en
// dateDebut/dateFin (désormais supportés par GET /notifications, voir backend/src/services/
// notificationService.js).
function periodRange(key) {
  if (!key) return {};
  const now = new Date();
  const toDateStr = (d) => d.toISOString().slice(0, 10);
  if (key === 'jour') return { dateDebut: toDateStr(now), dateFin: toDateStr(now) };
  if (key === 'semaine') {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    return { dateDebut: toDateStr(start), dateFin: toDateStr(now) };
  }
  if (key === 'mois') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { dateDebut: toDateStr(start), dateFin: toDateStr(now) };
  }
  return {};
}

export default function NotificationsScreen() {
  const { t, i18n } = useTranslation();
  const { markSeen } = useNotificationsBadge();
  const [items, setItems] = useState([]);
  const [period, setPeriod] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const PERIODS = [
    { value: undefined, label: t('notifications.periodAll') },
    { value: 'jour', label: t('notifications.periodToday') },
    { value: 'semaine', label: t('notifications.periodWeek') },
    { value: 'mois', label: t('notifications.periodMonth') },
  ];

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await getNotifications({ ...periodRange(period), limit: 100 });
      setItems(data);
    } catch (e) {
      setError(extractErrorMessage(e, t('notifications.loadError')));
    }
  }, [t, period]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
      markSeen();
    }, [load, markSeen])
  );

  // Temps réel (voir backend/src/services/notificationService.js) : une notification qui arrive
  // pendant que cet écran est déjà ouvert apparaît directement en tête de liste, sans attendre un
  // refocus ou un tirer-pour-rafraîchir.
  useEffect(() => {
    const onNew = (notif) => {
      setItems((prev) => [notif, ...prev]);
      markSeen();
    };
    socket.on('notification:new', onNew);
    return () => socket.off('notification:new', onNew);
  }, [markSeen]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handlePress = async (item) => {
    if (!item.lu) {
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, lu: 1 } : n)));
      try {
        await markNotificationRead(item.id);
      } catch (e) {
        if (e.response) {
          // Le serveur a répondu et a refusé — l'optimisme n'était pas justifié, on revient en arrière.
          setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, lu: 0 } : n)));
        } else {
          // Échec réseau (axios n'a reçu aucune réponse) : on garde l'affichage "lu" tel que le
          // marchand l'a vu, et on met l'action de côté pour la rejouer dès que la connexion revient
          // (voir utils/offlineReadQueue.js) plutôt que de la perdre silencieusement.
          await enqueueMarkRead(item.id);
        }
      }
    }
  };

  const handleMarkAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, lu: 1 })));
    try {
      await markAllNotificationsRead();
    } catch (e) {
      setError(extractErrorMessage(e, t('notifications.markAllError')));
    }
  };

  const hasUnread = items.some((n) => !n.lu);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('notifications.title')}</Text>
        {hasUnread ? (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAll}>{t('notifications.markAllRead')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.periodRow}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.value || 'all'}
            style={[styles.periodChip, period === p.value && styles.periodChipActive]}
            onPress={() => setPeriod(p.value)}
          >
            <Text style={[styles.periodChipText, period === p.value && styles.periodChipTextActive]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        // Sans extraData, FlatList mémorise ses lignes et ne les redessine pas juste parce que la
        // langue a changé — notificationText() dépend de `t`, donc le titre/contenu restaient
        // figés en cas de changement de langue sans navigation hors de cet écran.
        extraData={i18n.language}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.magenta} />}
        ListEmptyComponent={
          !loading ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                {error || (period ? t('notifications.emptyFiltered') : t('notifications.empty'))}
              </Text>
            </Card>
          ) : null
        }
        renderItem={({ item }) => {
          const { titre, contenu } = notificationText(item, t);
          return (
            <TouchableOpacity onPress={() => handlePress(item)} activeOpacity={0.8}>
              <Card style={[styles.notifCard, !item.lu && styles.notifCardUnread]}>
                <View style={styles.notifRow}>
                  <View style={styles.notifIcon}>
                    <Icon name={TYPE_ICONS[item.type] || 'bell'} size={20} color={colors.turquoise} />
                  </View>
                  <View style={styles.notifText}>
                    <Text style={styles.notifTitle}>{titre}</Text>
                    <Text style={styles.notifBody}>{contenu}</Text>
                    <Text style={styles.notifDate}>{formatDateTime(item.date_creation)}</Text>
                  </View>
                  {!item.lu ? <View style={styles.unreadDot} /> : null}
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
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
  markAll: { color: colors.blue, fontSize: 12.5, fontWeight: '600' },
  periodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20, marginTop: 14 },
  periodChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  periodChipActive: { backgroundColor: colors.blue, borderColor: colors.blue },
  periodChipText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  periodChipTextActive: { color: colors.text },
  listContent: { padding: 20 },
  emptyCard: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
  notifCard: { marginBottom: 10 },
  notifCardUnread: { borderColor: colors.turquoise },
  notifRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  notifIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: `${colors.turquoise}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifText: { flex: 1 },
  notifTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  notifBody: { color: colors.textSecondary, fontSize: 12.5, marginTop: 3, lineHeight: 17 },
  notifDate: { color: colors.textMuted, fontSize: 10.5, marginTop: 6 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.magenta, marginTop: 4 },
});
