import { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { StatusBadge } from './StatusBadge';
import { typography, spacing } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { formatCurrency, formatDate } from '../../utils/format';
import { getMyDirection, DEBT_TYPE_LABELS } from '../../utils/debts';
import type { Debt } from '@finance-flow/shared-types';

interface DebtCardProps {
  debt: Debt;
  myProfileId: number;
  onPress: () => void;
}

export const DebtCard = memo(function DebtCard({ debt, myProfileId, onPress }: DebtCardProps) {
  const { colors } = useTheme();
  const direction = getMyDirection(debt, myProfileId);
  const isReceivable = direction === 'receivable';
  const amountColor = isReceivable ? colors.success : colors.error;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${debt.name}, ${isReceivable ? 'te deben' : 'debes'} ${formatCurrency(Number(debt.amount))} a ${debt.contactName}`}
      accessibilityHint="Toca para ver el detalle de la deuda"
    >
      <GlassCard style={{ marginBottom: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: amountColor + '15',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name={isReceivable ? 'arrow-down-circle' : 'arrow-up-circle'}
              size={20}
              color={amountColor}
            />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[typography.titleMd, { color: colors.onSurface }]} numberOfLines={1}>
              {debt.name}
            </Text>
            <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
              {debt.contactName} · {DEBT_TYPE_LABELS[debt.debtType]}
            </Text>
            <Text style={[typography.bodySm, { color: colors.onSurfaceVariant, opacity: 0.8 }]}>
              {formatDate(debt.createdAt)}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <Text style={[typography.titleMd, { color: amountColor }]}>
              {isReceivable ? '+' : '-'}{formatCurrency(Number(debt.amount))}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <StatusBadge status={debt.status} />
              {debt.receiptUrl && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Ionicons name="receipt" size={14} color={colors.primary} />
                  <Text style={[typography.labelMd, { color: colors.primary }]}>Comp.</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
});
