import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import colors, { radii } from '../theme/colors';

const KYB_COLORS = {
  validé: colors.success,
  en_attente: colors.warning,
  rejeté: colors.error,
  suspendu: colors.error,
};

// `dark`: solid dark chip instead of a color-tinted one — needed when the badge sits on a
// bright/gradient background (e.g. the balance card), where a gold badge for "en_attente" on
// an orange/gold gradient becomes unreadable (gold-on-gold). Text/dot keep their status color
// for meaning, only the chip background changes so it reads on any backdrop.
export function KybBadge({ statut, dark, style }) {
  const { t } = useTranslation();
  const color = KYB_COLORS[statut] || colors.textMuted;
  const label = t(`status.kyb.${statut}`, { defaultValue: t('status.kyb.unknown') });
  return (
    <View
      style={[
        styles.badge,
        dark
          ? { backgroundColor: 'rgba(0,0,0,0.4)', borderColor: 'rgba(0,0,0,0.15)' }
          : { backgroundColor: `${color}22`, borderColor: color },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color: dark ? colors.text : color }]}>{label}</Text>
    </View>
  );
}

const TX_STATUS_COLORS = {
  réussi: colors.success,
  échoué: colors.error,
  en_attente: colors.warning,
};

export function TransactionStatusBadge({ statut, style }) {
  const { t } = useTranslation();
  const color = TX_STATUS_COLORS[statut] || colors.textMuted;
  const label = t(`status.tx.${statut}`, { defaultValue: statut });
  return (
    <View style={[styles.badge, { backgroundColor: `${color}22`, borderColor: color }, style]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
