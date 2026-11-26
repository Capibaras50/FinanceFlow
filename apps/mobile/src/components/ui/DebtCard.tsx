import { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GlassCard } from './GlassCard';
import { Glyph } from './Glyph';
import { StatusBadge } from './StatusBadge';
import { strokeWidth, typography, spacing } from '../../theme';
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
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${debt.name}, ${isReceivable ? 'te deben' : 'debes'} ${formatCurrency(Number(debt.amount))} a ${debt.contactName}`}
      accessibilityHint="Toca para ver el detalle de la deuda"
    >
      <GlassCard style={{ marginBottom: spacing.sm }}>
        <View accessible={false} style={{ position: 'absolute', left: 0, top: 12, bottom: 12, width: strokeWidth.thick, backgroundColor: amountColor }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingLeft: spacing.xs }}>
          <Glyph
            name={isReceivable ? 'arrow-down-circle' : 'arrow-up-circle'}
            tone={isReceivable ? 'success' : 'error'}
            size={48}
          />
          <View style={{ flex: 1, gap: spacing.xs }}>
            <Text style={[typography.titleLg, { color: colors.onSurface }]} numberOfLines={1}>
              {debt.name}
            </Text>
            <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
              {debt.contactName} · {DEBT_TYPE_LABELS[debt.debtType]}
            </Text>
            <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>
              {formatDate(debt.createdAt)}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: spacing.sm }}>
            <Text style={[typography.titleLg, { color: amountColor, fontVariant: ['tabular-nums'] }]}>
              {isReceivable ? '+' : '−'}{formatCurrency(Number(debt.amount))}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <StatusBadge status={debt.status} />
              {debt.receiptUrl && (
                <View accessible={false} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
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
