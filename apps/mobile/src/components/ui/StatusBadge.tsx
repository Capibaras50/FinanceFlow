import { View, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { borderRadius, spacing, strokeWidth, typography } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { DEBT_STATUS_LABELS } from '../../utils/debts';
import type { DebtStatus } from '@finance-flow/shared-types';
import type { TabIconName } from '../../navigation/types';

type Tone = 'primary' | 'success' | 'error' | 'outline';

const STATUS_META: Record<DebtStatus, { tone: Tone; icon: TabIconName }> = {
  pending: { tone: 'primary', icon: 'time' },
  paid: { tone: 'success', icon: 'checkmark-circle' },
  overdue: { tone: 'error', icon: 'alert-circle' },
  cancelled: { tone: 'outline', icon: 'close-circle' },
};

interface StatusBadgeProps {
  status: DebtStatus;
}

/** Compact label: icon + Spanish text + colour, never colour alone. */
export function StatusBadge({ status }: StatusBadgeProps) {
  const { colors } = useTheme();
  const meta = STATUS_META[status];
  const foreground =
    meta.tone === 'success'
      ? colors.success
      : meta.tone === 'error'
        ? colors.error
        : meta.tone === 'outline'
          ? colors.onSurfaceVariant
          : colors.primary;
  const background =
    meta.tone === 'success'
      ? colors.surfaceContainerHighest
      : meta.tone === 'error'
        ? colors.errorContainer
        : meta.tone === 'outline'
          ? colors.surfaceContainerLow
          : colors.primaryContainer;

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={DEBT_STATUS_LABELS[status]}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
        backgroundColor: background,
        borderWidth: strokeWidth.medium,
        borderColor: foreground,
      }}
    >
      <Ionicons accessible={false} name={meta.icon} size={13} color={foreground} />
      <Text accessible={false} style={[typography.labelMd, { color: foreground, fontSize: 10 }]}>
        {DEBT_STATUS_LABELS[status]}
      </Text>
    </View>
  );
}
