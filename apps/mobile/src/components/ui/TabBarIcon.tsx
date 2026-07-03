import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface TabBarIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  size?: number;
}

export function TabBarIcon({ name, focused, size = 24 }: TabBarIconProps) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(focused ? 1 : 0.9)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1 : 0.9,
      useNativeDriver: true,
      friction: 6,
      tension: 100,
    }).start();
  }, [focused, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Ionicons
        name={name}
        size={size}
        color={focused ? colors.primaryContainer : colors.onSurfaceVariant}
      />
    </Animated.View>
  );
}
