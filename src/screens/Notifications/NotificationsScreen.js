import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon';
import colors, { radii } from '../../theme/colors';
import Card from '../../components/Card';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../api/notifications';
import { formatDateTime } from '../../utils/format';
import { extractErrorMessage } from '../../api/client';

const TYPE_ICONS = {
  transaction: 'money-bill-transfer',
  système: 'circle-info',
  kyc: 'shield-halved',
};

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await getNotifications({ limit: 50 });
      setItems(data);
    } catch (e) {
      setError(extractErrorMessage(e, t('notifications.loadError')));
    }
  }, [t]);

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

  const handlePress = async (item) => {
    if (!item.lu) {
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, lu: 1 } : n)));
      try {
        await markNotificationRead(item.id);
      } catch (e) {
        // Non-blocking: revert silently on next refresh if it actually failed.
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

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.magenta} />}
        ListEmptyComponent={
          !loading ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>{error || t('notifications.empty')}</Text>
            </Card>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item)} activeOpacity={0.8}>
            <Card style={[styles.notifCard, !item.lu && styles.notifCardUnread]}>
              <View style={styles.notifRow}>
                <View style={styles.notifIcon}>
                  <Icon name={TYPE_ICONS[item.type] || 'bell'} size={20} color={colors.turquoise} />
                </View>
                <View style={styles.notifText}>
                  <Text style={styles.notifTitle}>{item.titre}</Text>
                  <Text style={styles.notifBody}>{item.contenu}</Text>
                  <Text style={styles.notifDate}>{formatDateTime(item.date_creation)}</Text>
                </View>
                {!item.lu ? <View style={styles.unreadDot} /> : null}
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
  markAll: { color: colors.blue, fontSize: 12.5, fontWeight: '600' },
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
