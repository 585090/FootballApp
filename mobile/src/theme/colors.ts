export const colors = {
  brand: {
    primary: '#D32F2F',
    primaryDark: '#A82323',
    primaryLight: '#FBD0D0',
    secondary: '#1976D2',
    secondaryDark: '#0D47A1',
    secondaryLight: '#D6E5F7',
    accent: '#FFC107',
    accentLight: '#FFF4D1',
  },
  surface: {
    background: '#F9F9F9',
    card: '#FFFFFF',
    cardSubtle: '#F2F2F2',
    overlay: 'rgba(33, 33, 33, 0.55)',
  },
  text: {
    primary: '#212121',
    secondary: '#5F6368',
    muted: '#9AA0A6',
    inverse: '#FFFFFF',
    onAccent: '#5C3B00',
  },
  border: {
    subtle: '#EEEEEE',
    default: '#E0E0E0',
    strong: '#BDBDBD',
  },
  state: {
    success: '#2E7D32',
    successBg: '#E6F4EA',
    danger: '#D32F2F',
    dangerBg: '#FBE9E9',
    warning: '#F57C00',
    info: '#1976D2',
  },
} as const;

export type Colors = typeof colors;
