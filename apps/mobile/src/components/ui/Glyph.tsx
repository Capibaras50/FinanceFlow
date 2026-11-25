import { useEffect, useRef } from 'react';
import { Animated, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { borderRadius, layout, spacing, strokeWidth, typography } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type GlyphTone = 'primary' | 'success' | 'error' | 'info' | 'neutral';

interface GlyphProps {
  name: keyof typeof Ionicons.glyphMap;
  tone?: GlyphTone;
  size?: number;
  badge?: number | string;
  active?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Weighted icon plate: the mechanical counterpart to the old bare Ionicons.
 * Decorative by design — the parent control owns the accessible name.
 */
export function Glyph({
  name,
  tone = 'neutral',
  size = layout.glyphSize,
  badge,
  active = false,
  style,
}: GlyphProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const rotate = useRef(new Animated.Value(active ? 90 : 0)).current;

  useEffect(() => {
    if (reduceMotion) {
      rotate.setValue(active ? 90 : 0);
      return;
    }
    Animated.spring(rotate, {
      toValue: active ? 90 : 0,
      damping: 18,
      stiffness: 220,
      mass: 0.6,
      useNativeDriver: true,
    }).start();
  }, [active, reduceMotion, rotate]);

  const palette: Record<GlyphTone, { bg: string; fg: string; border: string }> = {
    primary: { bg: colors.primaryContainer, fg: colors.primary, border: colors.primary },
    success: { bg: colors.surfaceContainerHighest, fg: colors.success, border: colors.success },
    error: { bg: colors.errorContainer, fg: colors.error, border: colors.error },
    info: { bg: colors.infoContainer, fg: colors.info, border: colors.info },
    neutral: { bg: colors.surfaceContainerHighest, fg: colors.onSurfaceVariant, border: colors.stroke },
  };
  const toneColors = palette[tone];
  const badgeText = typeof badge === 'number' && badge > 99 ? '99+' : badge;

  return (
    <Animated.View
      accessible={false}
      style={[
        {
          width: size,
          height: size,
          borderRadius: borderRadius.md,
          backgroundColor: toneColors.bg,
          borderWidth: active ? strokeWidth.thick : strokeWidth.medium,
          borderColor: toneColors.border,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
        !reduceMotion && {
          transform: [
            {
              rotate: rotate.interpolate({
                inputRange: [0, 90],
                outputRange: ['0deg', '90deg'],
              }),
            },
          ],
        },
      ]}
    >
      <Ionicons accessible={false} name={name} size={Math.round(size * 0.42)} color={toneColors.fg} />
      <View
        accessible={false}
        style={{
          position: 'absolute',
          top: -strokeWidth.medium,
          right: -strokeWidth.medium,
          width: 10,
          height: strokeWidth.thick,
          borderRadius: strokeWidth.thick,
          backgroundColor: toneColors.fg,
          transform: [{ rotate: '-45deg' }],
        }}
      />
      {badge !== undefined && (
        <View
          accessible={false}
          style={{
            position: 'absolute',
            top: -8,
            right: -10,
            minWidth: 22,
            height: 22,
            borderRadius: borderRadius.full,
            paddingHorizontal: spacing.xs,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primarySolid,
            borderWidth: strokeWidth.thin,
            borderColor: colors.surface,
          }}
        >
          <Text
            accessible={false}
            maxFontSizeMultiplier={1.2}
            style={[typography.labelMd, { color: colors.onPrimarySolid, fontSize: 10 }]}
          >
            {badgeText}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}
