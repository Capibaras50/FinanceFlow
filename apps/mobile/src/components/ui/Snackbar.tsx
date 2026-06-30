import { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { typography, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

type SnackbarType = 'error' | 'success';

interface SnackbarProps {
  message: string;
  type?: SnackbarType;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

export function Snackbar({ message, type = 'error', visible, onDismiss, duration = 3500 }: SnackbarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bgColor = type === 'error' ? colors.error : colors.success;
  const iconName = type === 'error' ? 'alert-circle' : 'checkmark-circle';

  useEffect(() => {
    if (visible) {
      if (timerRef.current) clearTimeout(timerRef.current);
      opacity.setValue(0);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
      timerRef.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => onDismiss());
      }, duration);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          backgroundColor: bgColor,
          bottom: insets.bottom + spacing.md,
          marginHorizontal: spacing.container,
        },
      ]}
    >
      <Ionicons name={iconName} size={20} color="#FFFFFF" />
      <Text style={[typography.bodyMd, styles.text]}>{message}</Text>
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
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  text: {
    color: '#FFFFFF',
    flex: 1,
  },
});
