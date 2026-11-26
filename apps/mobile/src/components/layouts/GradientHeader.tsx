import { View, Text } from 'react-native';
import type { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, strokeWidth, typography } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: ReactNode;
  /** Retained for API compatibility; the header is intentionally solid. */
  gradient?: readonly [string, string];
}

/** Heavy safe-front header: solid panel, thick lower stroke and a solid-action notch. */
export function GradientHeader({ title, subtitle, rightAction }: GradientHeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top + spacing.md,
        paddingBottom: spacing.lg,
        paddingHorizontal: spacing.container,
        backgroundColor: colors.surface,
        borderBottomWidth: strokeWidth.thick,
        borderBottomColor: colors.strokeStrong,
      }}
    >
      <View
        accessible={false}
        style={{
          position: 'absolute',
          top: insets.top,
          left: spacing.container,
          width: 44,
          height: strokeWidth.thick,
          backgroundColor: colors.primarySolid,
        }}
      />
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Text
            accessibilityRole="header"
            maxFontSizeMultiplier={1.5}
            style={[typography.headlineLg, { color: colors.onSurface }]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text style={[typography.bodySm, { color: colors.onSurfaceVariant, marginTop: spacing.xs }]}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightAction}
      </View>
    </View>
  );
}
