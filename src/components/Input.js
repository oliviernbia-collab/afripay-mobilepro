import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import colors, { radii } from '../theme/colors';

export default function Input({
  label,
  error,
  containerStyle,
  right,
  style,
  ...textInputProps
}) {
  const [focused, setFocused] = useState(false);

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
        {right}
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
