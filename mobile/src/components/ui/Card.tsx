import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii, shadows, spacing } from '@/theme';

export interface CardProps {
  children: ReactNode;
  elevated?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padding?: keyof typeof spacing | 0;
}

export function Card({ children, elevated = true, onPress, style, padding = 'lg' }: CardProps) {
  const pad = padding === 0 ? 0 : spacing[padding];
  const cardStyle: ViewStyle[] = [styles.card, { padding: pad }, elevated ? shadows.sm : null, style].filter(Boolean) as ViewStyle[];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [...cardStyle, pressed && styles.pressed]}>
        {children}
      </Pressable>
    );
  }
  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.subtle,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.997 }] },
});
