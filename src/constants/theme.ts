import { Platform } from 'react-native';

export const palette = {
  canvas: '#F6F1E7',
  canvasAlt: '#FFF9F0',
  surface: '#FFFDF8',
  surfaceMuted: '#F0E7D8',
  ink: '#22303C',
  inkSoft: '#5F6B75',
  accent: '#C87B2B',
  accentDeep: '#9E5A14',
  highlight: '#0F766E',
  highlightSoft: '#CDECE8',
  border: '#E0D4C1',
  signalGood: '#2F9E44',
  signalBad: '#D64545',
  signalWarn: '#D98E04',
  white: '#FFFFFF',
  shadow: 'rgba(34, 48, 60, 0.08)',
};

export const typography = {
  heading: Platform.select({
    ios: 'Avenir Next',
    android: 'sans-serif-medium',
    default: 'System',
  }),
  body: Platform.select({
    ios: 'Avenir',
    android: 'sans-serif',
    default: 'System',
  }),
};

export const radius = {
  sm: 12,
  md: 18,
  lg: 26,
  pill: 999,
};

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
};
