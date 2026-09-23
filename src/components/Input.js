import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';
import colors, { radii } from '../theme/colors';

export default function Input({
  label,
  error,
  containerStyle,
  right,
  style,
  secureTextEntry,
  ...textInputProps
}) {
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const isSecure = !!secureTextEntry;

  const toggle = isSecure ? (
    <Pressable
      onPress={() => setRevealed((v) => !v)}
      hitSlop={10}
      accessibilityLabel={revealed ? t('common.hidePassword') : t('common.showPassword')}
    >
      <Icon name={revealed ? 'eye-slash' : 'eye'} size={16} color={colors.textMuted} />
    </Pressable>
  ) : null;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrapper,
          focused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
        ]}
      >
        <TextInput
          placeholderTextColor={colors.textMuted}
          {...textInputProps}
          secureTextEntry={isSecure && !revealed}
          style={[styles.input, style]}
          onFocus={(e) => {
            setFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            textInputProps.onBlur?.(e);
          }}
        />
        {right || toggle}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
  },
  inputWrapperFocused: {
    borderColor: colors.turquoise,
  },
  inputWrapperError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 14,
  },
  error: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
});
