import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon';
import Card from '../../components/Card';
import colors, { radii } from '../../theme/colors';

const CONTACT_EMAIL = 'olivier@africorpgroup.tech';

export default function SupportScreen() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState(null);
  const faq = t('support.faq', { returnObjects: true });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Card style={{ paddingVertical: 4, marginBottom: 20 }}>
        <TouchableOpacity onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)} style={styles.contactRow} activeOpacity={0.8}>
          <View style={styles.contactIcon}>
            <Icon name="envelope" size={15} color={colors.turquoise} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactLabel}>{t('about.contactLabel')}</Text>
            <Text style={styles.contactValue}>{CONTACT_EMAIL}</Text>
          </View>
          <Icon name="chevron-right" size={15} color={colors.textMuted} />
        </TouchableOpacity>
      </Card>

      <Text style={styles.sectionTitle}>{t('support.faqSectionLabel')}</Text>
      {faq.map((item, index) => (
        <TouchableOpacity key={item.q} onPress={() => setOpenFaq(openFaq === index ? null : index)} activeOpacity={0.8}>
          <Card style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{item.q}</Text>
              <Icon name={openFaq === index ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
            </View>
            {openFaq === index ? <Text style={styles.faqAnswer}>{item.a}</Text> : null}
          </Card>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
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
  faqCard: { marginBottom: 10 },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { flex: 1, color: colors.text, fontSize: 13, fontWeight: '600', marginRight: 8 },
  faqAnswer: { color: colors.textSecondary, fontSize: 12.5, marginTop: 10, lineHeight: 18 },
});
