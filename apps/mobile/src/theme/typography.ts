import { Platform, type TextStyle } from 'react-native';

const fontFamily = {
  outfitBold: Platform.select({
    ios: 'Outfit_700Bold',
    android: 'Outfit_700Bold',
    default: 'System',
  }),
  interMedium: Platform.select({
    ios: 'Inter_500Medium',
    android: 'Inter_500Medium',
    default: 'System',
  }),
  interRegular: Platform.select({
    ios: 'Inter_400Regular',
    android: 'Inter_400Regular',
    default: 'System',
  }),
};

const tabularNumbers: TextStyle['fontVariant'] = ['tabular-nums'];

/**
 * Caja Fuerte type scale: heavy Outfit for structure and figures, Inter for
 * reading. Values keep tabular numerals so amount columns stay aligned.
 */
export const typography = {
  displayLg: {
    fontFamily: fontFamily.outfitBold,
    fontWeight: '700',
    fontSize: 42,
    lineHeight: 48,
    letterSpacing: -0.03,
    fontVariant: tabularNumbers,
    maxFontSizeMultiplier: 1.35,
  },
  displayMd: {
    fontFamily: fontFamily.outfitBold,
    fontWeight: '700',
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.02,
    fontVariant: tabularNumbers,
    maxFontSizeMultiplier: 1.4,
  },
  headlineLg: {
    fontFamily: fontFamily.outfitBold,
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.02,
    maxFontSizeMultiplier: 1.5,
  },
  headlineMd: {
    fontFamily: fontFamily.outfitBold,
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 28,
  },
  headlineSm: {
    fontFamily: fontFamily.outfitBold,
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 24,
  },
  titleLg: {
    fontFamily: fontFamily.outfitBold,
    fontWeight: '700',
    fontSize: 17,
    lineHeight: 22,
  },
  titleMd: {
    fontFamily: fontFamily.interMedium,
    fontWeight: '500',
    fontSize: 15,
    lineHeight: 21,
  },
  bodyLg: {
    fontFamily: fontFamily.interMedium,
    fontWeight: '500',
    fontSize: 15,
    lineHeight: 22,
  },
  bodyMd: {
    fontFamily: fontFamily.interRegular,
    fontSize: 15,
    lineHeight: 22,
  },
  bodySm: {
    fontFamily: fontFamily.interRegular,
    fontSize: 13,
    lineHeight: 19,
  },
  labelLg: {
    fontFamily: fontFamily.outfitBold,
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 18,
  },
  labelMd: {
    fontFamily: fontFamily.outfitBold,
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.01,
  },
} as const;
