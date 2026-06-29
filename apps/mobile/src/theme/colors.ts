import { Appearance } from 'react-native';

const darkPalette = {
  background: '#0B1326',
  surface: '#131B2E',
  surfaceDim: '#0B1326',
  surfaceBright: '#1E2A45',
  surfaceContainer: '#171F33',
  surfaceContainerHigh: '#222A3D',
  surfaceContainerHighest: '#2D3449',
  surfaceContainerLow: '#131B2E',
  surfaceContainerLowest: '#060E20',

  primary: '#D2BBFF',
  primaryContainer: '#7C3AED',
  onPrimary: '#3F008E',
  onPrimaryContainer: '#EDE0FF',
  inversePrimary: '#7C3AED',

  secondary: '#FFB0CD',
  secondaryContainer: '#AA0266',
  onSecondary: '#640039',
  onSecondaryContainer: '#FFBAD3',

  tertiary: '#4CD7F6',
  tertiaryContainer: '#007184',
  onTertiary: '#003640',
  onTertiaryContainer: '#B7EFFF',

  error: '#FB7185',
  errorContainer: '#93000A',
  onError: '#690005',
  onErrorContainer: '#FFDAD6',

  success: '#4ADE80',
  warning: '#FBBF24',

  onBackground: '#DAE2FD',
  onSurface: '#DAE2FD',
  onSurfaceVariant: '#CCC3D8',

  outline: '#958DA1',
  outlineVariant: '#4A4455',

  gradient: {
    primary: ['#7C3AED', '#D2BBFF'] as const,
    secondary: ['#EC4899', '#7C3AED'] as const,
    accent: ['#7C3AED', '#4CD7F6'] as const,
  },
} as const;

const lightPalette = {
  background: '#F0FDFA',
  surface: '#FFFFFF',
  surfaceDim: '#CCFBF1',
  surfaceBright: '#FFFFFF',
  surfaceContainer: '#F0FDFA',
  surfaceContainerHigh: '#E0F2F1',
  surfaceContainerHighest: '#CCFBF1',
  surfaceContainerLow: '#F9FFFE',
  surfaceContainerLowest: '#FFFFFF',

  primary: '#06B6D4',
  primaryContainer: '#06B6D4',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#FFFFFF',
  inversePrimary: '#06B6D4',

  secondary: '#EC4899',
  secondaryContainer: '#EC4899',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#FFFFFF',

  tertiary: '#7C3AED',
  tertiaryContainer: '#7C3AED',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#FFFFFF',

  error: '#DC2626',
  errorContainer: '#DC2626',
  onError: '#FFFFFF',
  onErrorContainer: '#FFFFFF',

  success: '#16A34A',
  warning: '#D97706',

  onBackground: '#0B1326',
  onSurface: '#0B1326',
  onSurfaceVariant: '#475569',

  outline: '#94A3B8',
  outlineVariant: '#CBD5E1',

  gradient: {
    primary: ['#06B6D4', '#0EA5E9'] as const,
    secondary: ['#7C3AED', '#06B6D4'] as const,
    accent: ['#EC4899', '#06B6D4'] as const,
  },
} as const;

export type ThemeColors = typeof darkPalette;
export type ColorKey = keyof ThemeColors;

export const palettes = {
  dark: darkPalette,
  light: lightPalette,
} as const;

export type ThemeMode = 'light' | 'dark';

export function getThemeColors(mode: ThemeMode): ThemeColors {
  return palettes[mode] as ThemeColors;
}

export function getSystemThemeMode(): ThemeMode {
  const scheme = Appearance.getColorScheme();
  return scheme === 'light' ? 'light' : 'dark';
}
