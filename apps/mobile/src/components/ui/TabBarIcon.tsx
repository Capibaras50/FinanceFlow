import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface TabBarIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  size?: number;
}

export function TabBarIcon({ name, focused, size = 24 }: TabBarIconProps) {
  const { colors } = useTheme();
  return (
    <Ionicons
      name={name}
      size={size}
      color={focused ? colors.primaryContainer : colors.onSurfaceVariant}
    />
  );
}
