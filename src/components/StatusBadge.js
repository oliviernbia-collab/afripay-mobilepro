import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors, { radii } from '../theme/colors';

const KYB_LABELS = {
  'validé': { label: 'Validé', color: colors.success },
  'en_attente': { label: 'En attente', color: colors.warning },
  'rejeté': { label: 'Rejeté', color: colors.error },
  'suspendu': { label: 'Suspendu', color: colors.error },
};

export function KybBadge({ statut, style }) {
  const info = KYB_LABELS[statut] || { label: statut || 'Inconnu', color: colors.textMuted };
  return (
    <View style={[styles.badge, { backgroundColor: `${info.color}22`, borderColor: info.color }, style]}>
      <View style={[styles.dot, { backgroundColor: info.color }]} />
      <Text style={[styles.text, { color: info.color }]}>{info.label}</Text>
    </View>
  );
}

const TX_STATUS_LABELS = {
  'réussi': { label: 'Réussi', color: colors.success },
  'échoué': { label: 'Échoué', color: colors.error },
  'en_attente': { label: 'En attente', color: colors.warning },
};

export function TransactionStatusBadge({ statut, style }) {
  const info = TX_STATUS_LABELS[statut] || { label: statut, color: colors.textMuted };
  return (
    <View style={[styles.badge, { backgroundColor: `${info.color}22`, borderColor: info.color }, style]}>
      <Text style={[styles.text, { color: info.color }]}>{info.label}</Text>
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
