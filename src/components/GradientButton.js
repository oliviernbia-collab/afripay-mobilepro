import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors, { gradients, radii } from '../theme/colors';

// variant: 'primary' (gradient CTA), 'secondary' (outline), 'ghost'
export default function GradientButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
  style,
}) {
  const isDisabled = disabled || loading;

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        style={[styles.secondary, isDisabled && styles.disabledBorder, style]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <View style={styles.row}>
            {icon}
            <Text style={styles.secondaryText}>{title}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'ghost') {
    return (
      <TouchableOpacity style={[styles.ghost, style]} onPress={onPress} disabled={isDisabled} activeOpacity={0.7}>
        <Text style={styles.ghostText}>{title}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[isDisabled && styles.disabledOpacity, style]}
    >
      <LinearGradient
        colors={isDisabled ? ['#3a3a42', '#3a3a42'] : gradients.cta}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.primary}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <View style={styles.row}>
            {icon}
            <Text style={styles.primaryText}>{title}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primary: {
    borderRadius: radii.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  secondary: {
    borderRadius: radii.md,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.turquoise,
    backgroundColor: 'transparent',
  },
  secondaryText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledBorder: {
    borderColor: colors.border,
    opacity: 0.6,
  },
  disabledOpacity: {
    opacity: 0.6,
  },
  ghost: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    color: colors.blue,
    fontSize: 14,
    fontWeight: '600',
  },
});
