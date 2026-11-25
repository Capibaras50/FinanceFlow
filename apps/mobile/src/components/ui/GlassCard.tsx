import { memo, useMemo } from 'react';
import { View, type ViewStyle, type StyleProp } from 'react-native';
import { borderRadius, spacing, strokeWidth } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Retained for compatibility; now tints the heavy border only. */
  glowColor?: string;
}

/** Weighted panel. The historical name stays so every screen keeps compiling. */
export const GlassCard = memo(function GlassCard({ children, style, glowColor }: GlassCardProps) {
  const { colors } = useTheme();
  const cardStyle = useMemo(
    () => ({
      backgroundColor: colors.surfaceContainerHigh,
      borderRadius: borderRadius.lg,
      borderWidth: strokeWidth.medium,
      borderColor: glowColor ?? colors.stroke,
      padding: spacing.md,
    }),
    [colors, glowColor]
  );
  return <View style={[cardStyle, style]}>{children}</View>;
});
