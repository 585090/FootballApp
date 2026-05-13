import { Platform, type TextStyle, type ViewStyle } from 'react-native';
import { colors } from './colors';

export { colors };

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
} as const;

const shadow = (elevation: number, opacity: number, radius: number, offsetY: number): ViewStyle =>
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: offsetY },
    },
    android: { elevation },
    default: {},
  }) as ViewStyle;

export const shadows = {
  none: {} as ViewStyle,
  sm: shadow(2, 0.06, 6, 2),
  md: shadow(4, 0.08, 12, 4),
  lg: shadow(8, 0.12, 20, 8),
} as const;

export const typography = {
  display: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5 } as TextStyle,
  h1: { fontSize: 26, fontWeight: '700', letterSpacing: -0.3 } as TextStyle,
  h2: { fontSize: 20, fontWeight: '700' } as TextStyle,
  h3: { fontSize: 17, fontWeight: '600' } as TextStyle,
  body: { fontSize: 15, fontWeight: '400' } as TextStyle,
  bodyBold: { fontSize: 15, fontWeight: '600' } as TextStyle,
  small: { fontSize: 13, fontWeight: '400' } as TextStyle,
  caption: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  } as TextStyle,
} as const;

export type TypographyVariant = keyof typeof typography;
