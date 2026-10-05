import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon';
import Card from '../../components/Card';
import colors, { radii } from '../../theme/colors';

const CONTACT_EMAIL = 'olivier@africorpgroup.tech';

export default function SupportScreen() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState(null);
  const [query, setQuery] = useState('');

  // Index figé AVANT filtrage par la recherche, pour que l'accordéon ouvert reste stable même
  // si la liste filtrée change de longueur (sinon `openFaq` pointerait sur le mauvais item).
  const faq = t('support.faq', { returnObjects: true }).map((item, index) => ({ ...item, index }));
  const needle = query.trim().toLowerCase();
  const filteredFaq = needle
    ? faq.filter((item) => item.q.toLowerCase().includes(needle) || item.a.toLowerCase().includes(needle))
    : faq;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.greeting}>{t('support.greeting')}</Text>
      <Text style={styles.heroTitle}>{t('support.title')}</Text>

      <Card style={{ paddingVertical: 4, marginBottom: 20 }}>
        <TouchableOpacity onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)} style={styles.contactRow} activeOpacity={0.8}>
          <View style={styles.contactIcon}>
            <Icon name="paper-plane" size={15} color={colors.turquoise} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactLabel}>{t('support.sendMessageLabel')}</Text>
            <Text style={styles.contactValue}>{CONTACT_EMAIL}</Text>
          </View>
          <Icon name="chevron-right" size={15} color={colors.textMuted} />
        </TouchableOpacity>
      </Card>

      <View style={styles.searchRow}>
        <Icon name="magnifying-glass" size={15} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('support.searchPlaceholder')}
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
      </View>

      <Text style={styles.sectionTitle}>{t('support.faqSectionLabel')}</Text>
      {filteredFaq.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{t('support.noResultsTitle')}</Text>
          <Text style={styles.emptyText}>{t('support.noResultsText')}</Text>
        </Card>
      ) : (
        filteredFaq.map((item) => {
          const open = openFaq === item.index;
          return (
            <TouchableOpacity key={item.q} onPress={() => setOpenFaq(open ? null : item.index)} activeOpacity={0.8}>
              <Card style={styles.faqCard}>
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{item.q}</Text>
                  <Icon name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
                </View>
                {open ? <Text style={styles.faqAnswer}>{item.a}</Text> : null}
              </Card>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  greeting: { color: colors.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  heroTitle: { color: colors.text, fontSize: 20, fontWeight: '700', lineHeight: 26, marginBottom: 20 },
  sectionTitle: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4 },
  contactIcon: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    backgroundColor: `${colors.turquoise}22`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactLabel: { color: colors.textMuted, fontSize: 11.5 },
  contactValue: { color: colors.text, fontSize: 14, fontWeight: '600', marginTop: 2 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 14, paddingVertical: 13 },
  emptyCard: { alignItems: 'center', paddingVertical: 24 },
  emptyTitle: { color: colors.text, fontWeight: '700', marginBottom: 6 },
  emptyText: { color: colors.textSecondary, fontSize: 13, lineHeight: 18, textAlign: 'center' },
  faqCard: { marginBottom: 10 },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { flex: 1, color: colors.text, fontSize: 13, fontWeight: '600', marginRight: 8 },
  faqAnswer: { color: colors.textSecondary, fontSize: 12.5, marginTop: 10, lineHeight: 18 },
});
