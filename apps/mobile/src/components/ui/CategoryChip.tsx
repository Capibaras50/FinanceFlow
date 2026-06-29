import { TouchableOpacity, Text } from 'react-native';
import { borderRadius, typography, spacing } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import type { Category } from '@finance-flow/shared-types';

interface CategoryChipProps {
  category: Category;
  selected?: boolean;
  onPress?: () => void;
}

export function CategoryChip({ category, selected, onPress }: CategoryChipProps) {
  const { colors } = useTheme();
  const bgColor = category.color || colors.primaryContainer;
  const selectedTextColor = category.color ? '#FFFFFF' : colors.onPrimaryContainer;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: selected ? bgColor : `${bgColor}26`,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderWidth: selected ? 0 : 1,
        borderColor: `${bgColor}40`,
      }}
    >
      <Text style={{ fontSize: 12 }}>{selected ? '✓' : ''}</Text>
      <Text
        style={[
          typography.labelMd,
          { color: selected ? selectedTextColor : bgColor },
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}
