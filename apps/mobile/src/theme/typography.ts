import { Platform } from 'react-native';

const fontFamily = {
  outfitBold: Platform.select({
    ios: 'Outfit_700Bold',
    android: 'Outfit_700Bold',
    default: 'System',
  }),
  outfitSemiBold: Platform.select({
    ios: 'Outfit_600SemiBold',
    android: 'Outfit_600SemiBold',
    default: 'System',
  }),
  interRegular: Platform.select({
    ios: 'Inter_400Regular',
    android: 'Inter_400Regular',
    default: 'System',
  }),
  interSemiBold: Platform.select({
    ios: 'Inter_600SemiBold',
    android: 'Inter_600SemiBold',
    default: 'System',
  }),
};

export const typography = {
  displayLg: {
    fontFamily: fontFamily.outfitBold,
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -0.02,
  },
  displayMd: {
    fontFamily: fontFamily.outfitBold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.01,
  },
  headlineLg: {
    fontFamily: fontFamily.outfitBold,
    fontSize: 28,
    lineHeight: 36,
  },
  headlineMd: {
    fontFamily: fontFamily.outfitSemiBold,
    fontSize: 24,
    lineHeight: 32,
  },
  headlineSm: {
    fontFamily: fontFamily.outfitSemiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  titleLg: {
    fontFamily: fontFamily.outfitSemiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  titleMd: {
    fontFamily: fontFamily.outfitSemiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  bodyLg: {
    fontFamily: fontFamily.interRegular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMd: {
    fontFamily: fontFamily.interRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  bodySm: {
    fontFamily: fontFamily.interRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  labelLg: {
    fontFamily: fontFamily.interSemiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.01,
  },
  labelMd: {
    fontFamily: fontFamily.interSemiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.01,
  },
} as const;
