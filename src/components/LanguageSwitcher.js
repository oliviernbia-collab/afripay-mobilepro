import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';

const LANGUAGES = [
  { code: 'fr', flag: '🇫🇷' },
  { code: 'en', flag: '🇬🇧' },
  { code: 'es', flag: '🇪🇸' },
];

// Compact 3-flag switcher for French / English / Spanish — placed next to the
// notification bell on the merchant dashboard. Tapping a flag switches the whole
// app's language immediately and persists the choice (see LanguageContext).
export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <View style={styles.pill}>
      {LANGUAGES.map((l) => {
        const active = l.code === language;
        return (
          <TouchableOpacity
            key={l.code}
            onPress={() => setLanguage(l.code)}
            hitSlop={4}
            activeOpacity={0.7}
            style={[styles.flagBtn, active && styles.flagBtnActive]}
          >
            <Text style={[styles.flag, !active && styles.flagInactive]}>{l.flag}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 3,
    gap: 2,
  },
  flagBtn: {
    width: 28,
    height: 28,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagBtnActive: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.turquoise,
  },
  flag: { fontSize: 14 },
  flagInactive: { opacity: 0.45 },
});
