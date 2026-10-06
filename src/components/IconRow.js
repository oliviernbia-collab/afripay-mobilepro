import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from './Icon';
import colors, { radii } from '../theme/colors';

/**
 * List row used throughout the mockup for operator lists, settings menus and
 * document checklists: a colored icon badge (or a real brand logo via
 * `image`), a label (+ optional subtitle), and a trailing chevron or custom
 * accessory on the right.
 */
export default function IconRow({
  icon,
  iconColor = colors.turquoise,
  image,
  imageResizeMode = 'cover',
  label,
  subtitle,
  selected,
  onPress,
  right,
  showChevron = true,
  style,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.row, selected && { borderColor: iconColor, backgroundColor: `${iconColor}14` }, style]}
    >
      <View style={[styles.iconWrap, { backgroundColor: image ? '#FFFFFF' : `${iconColor}22` }]}>
        {image ? (
          <Image source={image} style={styles.iconImage} resizeMode={imageResizeMode} />
        ) : (
          <Icon name={icon} size={16} color={iconColor} />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right ? right : showChevron ? <Icon name="chevron-right" size={14} color={colors.textMuted} /> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  iconImage: { width: '100%', height: '100%' },
  label: { color: colors.text, fontWeight: '600', fontSize: 14 },
  subtitle: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
});
