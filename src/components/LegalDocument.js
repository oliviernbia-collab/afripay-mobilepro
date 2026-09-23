import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import colors from '../theme/colors';

// Renders a titled legal document (Terms of use, Privacy policy) from an i18n namespace shaped
// as { title, lastUpdated, intro, sections: [{ title, body }] } — see TermsScreen/PrivacyScreen.
export default function LegalDocument({ namespaceKey }) {
  const { t } = useTranslation();
  const sections = t(`${namespaceKey}.sections`, { returnObjects: true });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>{t(`${namespaceKey}.title`)}</Text>
      <Text style={styles.lastUpdated}>{t(`${namespaceKey}.lastUpdated`)}</Text>
      <Text style={styles.intro}>{t(`${namespaceKey}.intro`)}</Text>

      {sections.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionBody}>{section.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: 6 },
  lastUpdated: { color: colors.textMuted, fontSize: 12, marginBottom: 16 },
  intro: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: 22, fontStyle: 'italic' },
  section: { marginBottom: 18 },
  sectionTitle: { color: colors.text, fontWeight: '700', fontSize: 14, marginBottom: 6 },
  sectionBody: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
});
