import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { colors, typography, type TypographyVariant } from '@/theme';

type ColorKey = 'primary' | 'secondary' | 'muted' | 'inverse' | 'brand' | 'danger' | 'success';

const colorMap: Record<ColorKey, string> = {
  primary: colors.text.primary,
  secondary: colors.text.secondary,
  muted: colors.text.muted,
  inverse: colors.text.inverse,
  brand: colors.brand.primary,
  danger: colors.state.danger,
  success: colors.state.success,
};

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: ColorKey;
  align?: TextStyle['textAlign'];
}

export function Text({ variant = 'body', color = 'primary', align, style, ...rest }: TextProps) {
  return (
    <RNText
      {...rest}
      style={[typography[variant], { color: colorMap[color], textAlign: align }, style]}
    />
  );
}
