import { Platform } from 'react-native';

const fontFamily = {
  outfit: Platform.select({
    ios: 'Outfit',
    android: 'Outfit',
    default: 'System',
  }),
  inter: Platform.select({
    ios: 'Inter',
    android: 'Inter',
    default: 'System',
  }),
};

export const typography = {
  displayLg: {
    fontFamily: fontFamily.outfit,
    fontSize: 40,
    fontWeight: '700' as const,
    lineHeight: 48,
    letterSpacing: -0.02,
  },
  displayMd: {
    fontFamily: fontFamily.outfit,
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.01,
  },
  headlineLg: {
    fontFamily: fontFamily.outfit,
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
  headlineMd: {
    fontFamily: fontFamily.outfit,
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  headlineSm: {
    fontFamily: fontFamily.outfit,
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  titleLg: {
    fontFamily: fontFamily.outfit,
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  titleMd: {
    fontFamily: fontFamily.outfit,
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  bodyLg: {
    fontFamily: fontFamily.inter,
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyMd: {
    fontFamily: fontFamily.inter,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodySm: {
    fontFamily: fontFamily.inter,
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  labelLg: {
    fontFamily: fontFamily.inter,
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: 0.01,
  },
  labelMd: {
    fontFamily: fontFamily.inter,
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.01,
  },
} as const;
