import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { colors, radii, spacing, typography } from '@/theme';
import { Text } from './Text';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, style, onFocus, onBlur, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.state.danger
    : focused
      ? colors.brand.primary
      : colors.border.default;

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text variant="caption" color="secondary" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <TextInput
        {...rest}
        placeholderTextColor={colors.text.muted}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[styles.input, { borderColor }, style]}
      />
      {error ? (
        <Text variant="small" color="danger" style={styles.feedback}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="small" color="muted" style={styles.feedback}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  label: { marginLeft: 2 },
  input: {
    ...typography.body,
    color: colors.text.primary,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  feedback: { marginLeft: 2, marginTop: 2 },
});
