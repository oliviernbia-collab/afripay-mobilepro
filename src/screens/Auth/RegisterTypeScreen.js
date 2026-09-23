import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon';
import colors, { radii } from '../../theme/colors';

export default function RegisterTypeScreen({ navigation }) {
  const { t } = useTranslation();

  const OPTIONS = [
    {
      type: 'entreprise',
      title: t('auth.registerType.entrepriseTitle'),
      description: t('auth.registerType.entrepriseDesc'),
      icon: 'building',
      color: colors.blue,
    },
    {
      type: 'particulier',
      title: t('auth.registerType.particulierTitle'),
      description: t('auth.registerType.particulierDesc'),
      icon: 'user',
      color: colors.magenta,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.registerType.title')}</Text>
      <Text style={styles.subtitle}>{t('auth.registerType.subtitle')}</Text>

      <View style={styles.options}>
        {OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.type}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('RegisterForm', { type: opt.type })}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${opt.color}22` }]}>
              <Icon name={opt.icon} size={28} color={opt.color} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{opt.title}</Text>
              <Text style={styles.cardDesc}>{opt.description}</Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 28,
  },
  options: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 14,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  cardDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
});
