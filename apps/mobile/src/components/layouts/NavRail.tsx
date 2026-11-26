import { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Glyph } from '../ui/Glyph';
import { borderRadius, strokeWidth, layout, spacing, typography } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

export interface NavRailItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface NavRailProps {
  items: readonly NavRailItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  onAdd: () => void;
}

/** Wide-screen navigation: a thick steel rail with plates that turn when active. */
export const NavRail = memo(function NavRail({ items, activeKey, onSelect, onAdd }: NavRailProps) {
  const { colors } = useTheme();

  return (
    <View
      accessible={false}
      style={{
        width: 96,
        alignItems: 'center',
        paddingTop: spacing.lg,
        paddingBottom: spacing.lg,
        gap: spacing.md,
        backgroundColor: colors.surface,
        borderRightWidth: strokeWidth.thick,
        borderColor: colors.strokeStrong,
      }}
    >
      <Glyph name="wallet" tone="primary" size={48} active style={{ marginBottom: spacing.md }} />

      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <TouchableOpacity
            key={item.key}
            onPress={() => onSelect(item.key)}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: active }}
            hitSlop={6}
            style={{
              width: 80,
              minHeight: layout.touchTarget + 16,
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.xs,
              borderRadius: borderRadius.md,
              backgroundColor: active ? colors.primaryContainer : 'transparent',
              borderWidth: active ? strokeWidth.thick : 0,
              borderColor: colors.primary,
            }}
          >
            <Glyph
              name={item.icon}
              tone={active ? 'primary' : 'neutral'}
              size={40}
              active={active}
            />
            <Text
              style={[
                typography.labelMd,
                { color: active ? colors.primary : colors.onSurfaceVariant, fontSize: 11, textAlign: 'center' },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        onPress={onAdd}
        accessibilityRole="button"
        accessibilityLabel="Añadir movimiento"
        accessibilityHint="Abre las opciones para registrar gasto, ingreso o deuda"
        hitSlop={6}
        style={{
          width: 60,
          height: 60,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: spacing.sm,
          borderRadius: borderRadius.md,
          backgroundColor: colors.primarySolid,
          borderWidth: strokeWidth.thick,
          borderColor: colors.actionBorder,
        }}
      >
        <Ionicons accessible={false} name="add" size={26} color={colors.onPrimarySolid} />
      </TouchableOpacity>
    </View>
  );
});
