import { useRef, useState } from 'react';
import { Animated, Pressable, Text, View, ActivityIndicator, type StyleProp, type ViewStyle } from 'react-native';
import { borderRadius, layout, outlineColor, spacing, strokeWidth, typography } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  /** Retained for API compatibility; the button uses the solid action token. */
  gradient?: readonly [string, string];
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  variant?: 'primary' | 'outlined' | 'ghost';
  accessibilityLabel?: string;
}

type Variant = NonNullable<GradientButtonProps['variant']>;

export function GradientButton({
  title,
  onPress,
  disabled,
  loading = false,
  style,
  variant = 'primary',
  accessibilityLabel,
}: GradientButtonProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const [focused, setFocused] = useState(false);
  const inactive = disabled || loading;

  const animateTo = (value: number) => {
    if (reduceMotion) {
      scale.setValue(1);
      return;
    }
    Animated.spring(scale, {
      toValue: value,
      damping: 20,
      stiffness: 380,
      mass: 0.5,
      useNativeDriver: true,
    }).start();
  };

  const tones: Record<Variant, { background: string; foreground: string; border: string }> = {
    primary: {
      background: inactive ? colors.surfaceContainerHighest : colors.primarySolid,
      foreground: inactive ? colors.onSurfaceVariant : colors.onPrimarySolid,
      border: inactive ? colors.outlineVariant : colors.actionBorder,
    },
    outlined: {
      background: inactive ? colors.surfaceContainerLow : colors.primaryContainer,
      foreground: inactive ? colors.onSurfaceVariant : colors.primary,
      border: colors.actionBorder,
    },
    ghost: {
      background: 'transparent',
      foreground: colors.onSurfaceVariant,
      border: 'transparent',
    },
  };
  const tone = tones[variant];

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={inactive ? undefined : onPress}
        onPressIn={() => animateTo(0.96)}
        onPressOut={() => animateTo(1)}
        disabled={inactive}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        hitSlop={4}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityState={{ disabled: inactive, busy: loading }}
        style={{
          minHeight: layout.primaryButtonHeight,
          minWidth: layout.touchTarget,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.lg,
          borderRadius: borderRadius.md,
          backgroundColor: tone.background,
          borderWidth: variant === 'ghost' ? 0 : strokeWidth.thick,
          borderColor: tone.border,
          ...(focused && !inactive ? outlineColor(colors.primary) : {}),
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          {loading && (
            <ActivityIndicator size="small" color={tone.foreground} accessibilityLabel="Cargando" />
          )}
          <Text style={[typography.labelLg, { color: tone.foreground, textAlign: 'center' }]}>
            {title}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
