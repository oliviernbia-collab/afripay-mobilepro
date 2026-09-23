import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import BrandHeader from '../../components/BrandHeader';
import Card from '../../components/Card';
import Icon from '../../components/Icon';
import colors, { radii } from '../../theme/colors';
import appConfig from '../../../app.json';

const CONTACT_EMAIL = 'olivier@africorpgroup.tech';

export default function AboutScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <BrandHeader size="compact" showTagline />
        <Text style={styles.version}>{t('about.version', { version: appConfig.expo.version })}</Text>
      </View>

      <Card style={styles.descCard}>
        <Text style={styles.description}>{t('about.description')}</Text>
      </Card>

      <Text style={styles.sectionTitle}>{t('about.contactLabel')}</Text>
      <Card style={{ paddingVertical: 4 }}>
        <TouchableOpacity onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)} style={styles.row} activeOpacity={0.8}>
          <View style={styles.rowIcon}>
            <Icon name="envelope" size={15} color={colors.turquoise} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>{t('about.emailLabel')}</Text>
            <Text style={styles.rowValue}>{CONTACT_EMAIL}</Text>
          </View>
          <Icon name="chevron-right" size={15} color={colors.textMuted} />
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginTop: 10, marginBottom: 24 },
  version: { color: colors.textSecondary, fontSize: 12.5, marginTop: 12 },
  descCard: { marginBottom: 20 },
  description: { color: colors.textSecondary, fontSize: 13.5, lineHeight: 20, textAlign: 'center' },
  sectionTitle: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    backgroundColor: `${colors.turquoise}22`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowLabel: { color: colors.textMuted, fontSize: 11.5 },
  rowValue: { color: colors.text, fontSize: 14, fontWeight: '600', marginTop: 2 },
});
