import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography, spacing } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  gradient?: readonly [string, string];
}

export function GradientHeader({
  title,
  subtitle,
  rightAction,
  gradient,
}: GradientHeaderProps) {
  const { colors } = useTheme();
  const resolvedGradient = gradient ?? colors.gradient.primary;
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={resolvedGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingTop: insets.top + spacing.md,
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.container,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.headlineMd, { color: '#FFFFFF' }]}>{title}</Text>
          {subtitle && (
            <Text style={[typography.bodyMd, { color: 'rgba(255,255,255,0.7)', marginTop: spacing.xs }]}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightAction}
      </View>
    </LinearGradient>
  );
}
