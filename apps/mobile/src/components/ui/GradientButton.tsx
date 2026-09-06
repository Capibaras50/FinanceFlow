import { TouchableOpacity, Text, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { borderRadius, typography, spacing } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  gradient?: readonly [string, string];
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  variant?: 'primary' | 'outlined' | 'ghost';
  accessibilityLabel?: string;
}

export function GradientButton({
  title,
  onPress,
  gradient,
  disabled,
  style,
  variant = 'primary',
  accessibilityLabel,
}: GradientButtonProps) {
  const { colors } = useTheme();
  const resolvedGradient = gradient ?? colors.gradient.primary;
  const a11yProps = {
    accessibilityRole: 'button' as const,
    accessibilityLabel: accessibilityLabel ?? title,
    accessibilityState: { disabled: !!disabled },
  };
  if (variant === 'outlined') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        {...a11yProps}
        style={[
          {
            borderRadius: borderRadius.full,
            borderWidth: 1.5,
            borderColor: colors.tertiary,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            alignItems: 'center',
            opacity: disabled ? 0.5 : 1,
          },
          style,
        ]}
      >
        <Text
          style={[
            typography.labelLg,
            { color: colors.tertiary },
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  if (variant === 'ghost') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        {...a11yProps}
        style={[
          {
            borderRadius: borderRadius.full,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            alignItems: 'center',
            opacity: disabled ? 0.5 : 1,
          },
          style,
        ]}
      >
        <Text
          style={[
            typography.labelLg,
            { color: colors.onSurfaceVariant },
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} {...a11yProps} style={style}>
      <LinearGradient
        colors={resolvedGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: borderRadius.full,
          paddingVertical: spacing.md,
          alignItems: 'center',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Text
          style={[
            typography.labelLg,
            { color: '#FFFFFF' },
          ]}
        >
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
