import { memo, useMemo } from 'react';
import { View, type ViewStyle, type StyleProp } from 'react-native';
import { borderRadius } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  glowColor?: string;
}

export const GlassCard = memo(function GlassCard({ children, style, glowColor }: GlassCardProps) {
  const { colors } = useTheme();
  const cardStyle = useMemo(
    () => ({
      backgroundColor: colors.surfaceContainerHigh + 'D9',
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.outlineVariant + '60',
      padding: 16,
      shadowColor: glowColor ?? colors.primary,
      shadowOffset: { width: 0, height: 4 as const },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 6,
    }),
    [colors, glowColor]
  );
  return <View style={[cardStyle, style]}>{children}</View>;
});
