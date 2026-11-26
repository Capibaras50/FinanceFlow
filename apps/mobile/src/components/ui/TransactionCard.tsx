import { memo } from 'react';
import { View, Text } from 'react-native';
import { GlassCard } from './GlassCard';
import { Glyph } from './Glyph';
import { borderRadius, strokeWidth, typography, spacing } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { formatCurrency, formatDate, getCategoryColor } from '../../utils/format';
import type { Expense, Earning } from '@finance-flow/shared-types';

interface TransactionCardProps {
  transaction: Expense | Earning;
  type: 'expense' | 'earning';
  walletName?: string;
}

/** Some list responses still expose the legacy snake_case wallet name. */
function getLegacyWalletName(transaction: Expense | Earning): string | undefined {
  const candidate = transaction as { wallet_name?: unknown };
  return typeof candidate.wallet_name === 'string' ? candidate.wallet_name : undefined;
}

export const TransactionCard = memo(function TransactionCard({
  transaction,
  type,
  walletName,
}: TransactionCardProps) {
  const { colors } = useTheme();
  const isExpense = type === 'expense';
  // The full frame carries the semantic colour: red for expenses, green for earnings.
  const amountColor = isExpense ? colors.error : colors.success;
  const name =
    walletName ??
    transaction.wallet?.name ??
    getLegacyWalletName(transaction);
  const categoryColor = transaction.category?.color
    ? getCategoryColor(transaction.category.color)
    : undefined;

  return (
    <GlassCard
      glowColor={amountColor}
      style={{ marginBottom: spacing.sm, borderWidth: strokeWidth.thick }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingLeft: spacing.xs }}>
        <Glyph
          name={isExpense ? 'trending-down' : 'trending-up'}
          tone={isExpense ? 'error' : 'success'}
          size={48}
        />
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text style={[typography.titleLg, { color: colors.onSurface }]} numberOfLines={1}>
            {transaction.name}
          </Text>
          <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
            {formatDate(transaction.createdAt)}{name ? ` · ${name}` : ''}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: spacing.xs }}>
          <Text style={[typography.titleLg, { color: amountColor, fontVariant: ['tabular-nums'] }]}>
            {isExpense ? '−' : '+'}{formatCurrency(transaction.value)}
          </Text>
          {transaction.category && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, maxWidth: 160 }}>
              {categoryColor && (
                <View
                  accessible={false}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: borderRadius.sm,
                    backgroundColor: categoryColor,
                  }}
                />
              )}
              <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                {transaction.category.name}
              </Text>
            </View>
          )}
        </View>
      </View>
    </GlassCard>
  );
});
