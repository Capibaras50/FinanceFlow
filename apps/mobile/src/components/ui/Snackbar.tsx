import { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { typography, strokeWidth, spacing, borderRadius, motion } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type SnackbarType = 'error' | 'success';

interface SnackbarProps {
  message: string;
  type?: SnackbarType;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

export function Snackbar({
  message,
  type = 'error',
  visible,
  onDismiss,
  duration = 3500,
}: SnackbarProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  const accent = type === 'error' ? colors.error : colors.success;
  const iconName = type === 'error' ? 'alert-circle' : 'checkmark-circle';
  const animationDuration = reduceMotion ? 0 : motion.press;

  useEffect(() => {
    if (visible) {
      if (timerRef.current) clearTimeout(timerRef.current);
      opacity.setValue(0);
      Animated.timing(opacity, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: true,
      }).start();
      timerRef.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }).start(() => onDismissRef.current());
      }, duration);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, duration, animationDuration, opacity]);

  if (!visible) return null;

  return (
    <Animated.View
      accessible
      accessibilityRole={type === 'error' ? 'alert' : 'text'}
      accessibilityLiveRegion="polite"
      accessibilityLabel={message}
      style={[
        styles.container,
        {
          opacity,
          backgroundColor: colors.surfaceContainerHighest,
          borderColor: accent,
          bottom: insets.bottom + spacing.md,
          marginHorizontal: spacing.container,
        },
      ]}
    >
      <Ionicons accessible={false} name={iconName} size={20} color={accent} />
      <Text style={[typography.bodyMd, styles.text, { color: colors.onSurface }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: strokeWidth.medium,
    zIndex: 9999,
  },
  text: {
    flex: 1,
  },
});
