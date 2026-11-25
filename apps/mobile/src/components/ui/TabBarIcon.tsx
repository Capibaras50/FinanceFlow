import Ionicons from '@expo/vector-icons/Ionicons';
import { Glyph } from './Glyph';
import { layout } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

interface TabBarIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  size?: number;
}

/** Tab icons sit on a mechanical plate; the active plate turns once. */
export function TabBarIcon({ name, focused, size = 34 }: TabBarIconProps) {
  const { colors } = useTheme();
  return (
    <Glyph
      name={name}
      size={Math.min(size, layout.touchTarget)}
      tone={focused ? 'primary' : 'neutral'}
      active={focused}
      style={{ borderColor: focused ? colors.primary : colors.stroke }}
    />
  );
}
