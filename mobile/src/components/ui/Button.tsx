import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, radii, spacing, typography } from '@/theme';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  fullWidth = true,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const v = variantStyles[variant];
  const s = sizeStyles[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        v.container,
        s.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.textColor} />
      ) : (
        <View style={styles.contentRow}>
          <Text style={[v.text, s.text]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
  },
  fullWidth: { alignSelf: 'stretch' },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
  contentRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});

const variantStyles = {
  primary: {
    container: { backgroundColor: colors.brand.primary } as ViewStyle,
    text: { color: colors.text.inverse, ...typography.bodyBold },
    textColor: colors.text.inverse,
  },
  secondary: {
    container: {
      backgroundColor: colors.surface.card,
      borderWidth: 1,
      borderColor: colors.border.default,
    } as ViewStyle,
    text: { color: colors.text.primary, ...typography.bodyBold },
    textColor: colors.text.primary,
  },
  ghost: {
    container: { backgroundColor: 'transparent' } as ViewStyle,
    text: { color: colors.brand.primary, ...typography.bodyBold },
    textColor: colors.brand.primary,
  },
  danger: {
    container: { backgroundColor: colors.state.danger } as ViewStyle,
    text: { color: colors.text.inverse, ...typography.bodyBold },
    textColor: colors.text.inverse,
  },
};

const sizeStyles = {
  sm: {
    container: { paddingVertical: 8, paddingHorizontal: spacing.md } as ViewStyle,
    text: { fontSize: 13 },
  },
  md: {
    container: { paddingVertical: 12, paddingHorizontal: spacing.lg } as ViewStyle,
    text: { fontSize: 15 },
  },
  lg: {
    container: { paddingVertical: 16, paddingHorizontal: spacing.lg } as ViewStyle,
    text: { fontSize: 16 },
  },
};
