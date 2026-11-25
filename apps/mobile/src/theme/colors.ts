import { Appearance } from 'react-native';

/**
 * Caja Fuerte — a weighted, high-contrast palette for Android, iOS and web.
 *
 * Every historical ThemeColors key is retained for compatibility; new keys add
 * the strong strokes, solid action fill and skeleton tones used by this design.
 * Screens must read colours through `useTheme()`, never through literals.
 */
const darkPalette = {
  background: '#101516',
  surface: '#1A2223',
  surfaceDim: '#101516',
  surfaceBright: '#25302F',
  surfaceContainer: '#1A2223',
  surfaceContainerHigh: '#25302F',
  surfaceContainerHighest: '#2E3B39',
  surfaceContainerLow: '#151C1E',
  surfaceContainerLowest: '#0B1011',

  primary: '#FF8A4C',
  primaryContainer: '#3A1E10',
  onPrimary: '#1A0E06',
  onPrimaryContainer: '#FFD8C2',
  primarySolid: '#FF6A2A',
  onPrimarySolid: '#1A0E06',
  inversePrimary: '#B8430A',

  secondary: '#8CA8FF',
  secondaryContainer: '#1E2A45',
  onSecondary: '#0B1224',
  onSecondaryContainer: '#DCE6FF',

  tertiary: '#A9BAB5',
  tertiaryContainer: '#2A3635',
  onTertiary: '#101516',
  onTertiaryContainer: '#DCE8E3',

  error: '#FF8577',
  errorContainer: '#46201D',
  onError: '#24100E',
  onErrorContainer: '#FFE1DE',

  success: '#5DE0B6',
  successContainer: '#12352D',
  onSuccessContainer: '#C9F6E6',
  warning: '#FF8A4C',

  info: '#8CA8FF',
  infoContainer: '#1E2A45',
  onInfo: '#0B1224',

  onBackground: '#F3F7F4',
  onSurface: '#F3F7F4',
  onSurfaceVariant: '#A9BAB5',

  outline: '#4A5D59',
  outlineVariant: '#354744',
  stroke: '#4A5D59',
  strokeStrong: '#7C9A93',

  skeletonBase: '#2A3635',
  skeletonShine: '#3D4E4B',

  scrim: 'rgba(4, 8, 9, 0.76)',

  // Retained for API compatibility. Values are flat; no data surface is a gradient.
  gradient: {
    primary: ['#FF8A4C', '#FF8A4C'] as const,
    secondary: ['#8CA8FF', '#8CA8FF'] as const,
    accent: ['#25302F', '#25302F'] as const,
  },
} as const;

const lightPalette = {
  background: '#E9EFEC',
  surface: '#FFFFFF',
  surfaceDim: '#DCE6E1',
  surfaceBright: '#FFFFFF',
  surfaceContainer: '#F4F8F5',
  surfaceContainerHigh: '#F4F8F5',
  surfaceContainerHighest: '#E9EFEC',
  surfaceContainerLow: '#F7FAF8',
  surfaceContainerLowest: '#FFFFFF',

  primary: '#B8430A',
  primaryContainer: '#FFE3D2',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#7A2C05',
  primarySolid: '#C2410C',
  onPrimarySolid: '#FFFFFF',
  inversePrimary: '#FF8A4C',

  secondary: '#3155B5',
  secondaryContainer: '#E1E8FF',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#1B2F6B',

  tertiary: '#4F615C',
  tertiaryContainer: '#DCE8E3',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#263A35',

  error: '#B02E2E',
  errorContainer: '#FFE1DE',
  onError: '#FFFFFF',
  onErrorContainer: '#57191A',

  success: '#0B6E56',
  successContainer: '#DCF5EA',
  onSuccessContainer: '#0B4F3E',
  warning: '#B8430A',

  info: '#3155B5',
  infoContainer: '#E1E8FF',
  onInfo: '#FFFFFF',

  onBackground: '#101716',
  onSurface: '#101716',
  onSurfaceVariant: '#4F615C',

  outline: '#B7C6C1',
  outlineVariant: '#D3DEDA',
  stroke: '#B7C6C1',
  strokeStrong: '#6E837D',

  skeletonBase: '#E1E9E5',
  skeletonShine: '#F3F7F5',

  scrim: 'rgba(16, 23, 22, 0.42)',

  gradient: {
    primary: ['#B8430A', '#B8430A'] as const,
    secondary: ['#3155B5', '#3155B5'] as const,
    accent: ['#F4F8F5', '#F4F8F5'] as const,
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
