import { TouchableOpacity, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { borderRadius, strokeWidth, layout, typography, spacing } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import type { Category } from '@finance-flow/shared-types';

interface CategoryChipProps {
  category: Category;
  selected?: boolean;
  onPress?: () => void;
}

export function CategoryChip({ category, selected, onPress }: CategoryChipProps) {
  const { colors } = useTheme();
  const tone = category.type === 'expense' ? colors.error : colors.success;
  const tint = category.type === 'expense' ? colors.errorContainer : colors.successContainer;

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${category.name}, ${category.type === 'expense' ? 'gastos' : 'ingresos'}`}
      accessibilityState={{ selected: !!selected }}
      hitSlop={4}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        minHeight: layout.touchTarget,
        backgroundColor: selected ? tint : colors.surfaceContainerHigh,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderWidth: selected ? strokeWidth.thick : strokeWidth.medium,
        borderColor: tone,
      }}
    >
      <View
        accessible={false}
        style={{
          width: 12,
          height: 12,
          borderRadius: borderRadius.sm,
          backgroundColor: category.color || colors.primary,
          borderWidth: strokeWidth.thin,
          borderColor: colors.outlineVariant,
        }}
      />
      <Text
        style={[
          typography.labelLg,
          { color: selected ? tone : colors.onSurface },
        ]}
      >
        {category.name}
      </Text>
      {selected && <Ionicons accessible={false} name="checkmark" size={14} color={tone} />}
    </TouchableOpacity>
  );
}
