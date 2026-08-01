import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography, borderRadius } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { DEBT_STATUS_LABELS } from '../../utils/debts';
import type { DebtStatus } from '@finance-flow/shared-types';
import type { TabIconName } from '../../navigation/types';

const STATUS_META: Record<DebtStatus, { color: 'primary' | 'success' | 'error' | 'outline'; icon: TabIconName }> = {
  pending: { color: 'primary', icon: 'time' },
  paid: { color: 'success', icon: 'checkmark-circle' },
  overdue: { color: 'error', icon: 'alert-circle' },
  cancelled: { color: 'outline', icon: 'close-circle' },
};

interface StatusBadgeProps {
  status: DebtStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { colors } = useTheme();
  const meta = STATUS_META[status];
  const color = colors[meta.color];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: borderRadius.full,
        backgroundColor: color + '1F',
        borderWidth: 1,
        borderColor: color + '40',
      }}
    >
      <Ionicons name={meta.icon} size={12} color={color} />
      <Text style={[typography.labelMd, { color, fontSize: 11 }]}>
        {DEBT_STATUS_LABELS[status]}
      </Text>
    </View>
  );
}
