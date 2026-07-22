import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { typography, spacing } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { formatCurrency, formatDate, getCategoryColor } from '../../utils/format';
import type { Expense, Earning } from '@finance-flow/shared-types';

interface TransactionCardProps {
  transaction: Expense | Earning;
  type: 'expense' | 'earning';
}

export function TransactionCard({ transaction, type }: TransactionCardProps) {
  const { colors } = useTheme();
  const isExpense = type === 'expense';
  const amountColor = isExpense ? colors.error : colors.success;
  const sign = isExpense ? '-' : '+';
  const iconName = isExpense ? 'trending-down' : 'trending-up';

  return (
    <GlassCard style={{ marginBottom: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: transaction.category
              ? getCategoryColor(transaction.category.color) + '20'
                              : colors.primary + '20',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name={iconName}
            size={20}
            color={transaction.category
              ? getCategoryColor(transaction.category.color)
              : colors.primary}
          />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[typography.titleMd, { color: colors.onSurface }]}>
            {transaction.name}
          </Text>
          <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>
            {formatDate(transaction.createdAt)} · {transaction.wallet?.name}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 2 }}>
          <Text style={[typography.titleMd, { color: amountColor }]}>
            {sign}{formatCurrency(transaction.value)}
          </Text>
          {transaction.category && (
            <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>
              {transaction.category.name}
            </Text>
          )}
        </View>
      </View>
    </GlassCard>
  );
}
