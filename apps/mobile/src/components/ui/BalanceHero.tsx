import { View, Text, StyleSheet, type DimensionValue } from 'react-native';
import { borderRadius, spacing, strokeWidth, typography } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { formatCurrency } from '../../utils/format';
import { CountUp } from './CountUp';
import { Dial } from './Dial';

interface BalanceHeroProps {
  balance: number;
  income: number;
  expenses: number;
  label?: string;
}

/** The one orchestrated moment: a safe door with a real balance and a thick meter. */
export function BalanceHero({
  balance,
  income,
  expenses,
  label = 'Saldo total',
}: BalanceHeroProps) {
  const { colors } = useTheme();
  const max = Math.max(income, expenses, 1);
  const incomeWidth: DimensionValue = `${Math.max(0, (income / max) * 100)}%`;
  const expenseWidth: DimensionValue = `${Math.max(0, (expenses / max) * 100)}%`;
  const dialProgress = Math.min(1, Math.abs(balance) / max);
  const balanceText = formatCurrency(balance);

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${label}: ${balanceText}. Ingresos ${formatCurrency(income)}. Gastos ${formatCurrency(expenses)}`}
      style={[
        styles.hero,
        {
          backgroundColor: colors.surface,
          borderColor: colors.strokeStrong,
        },
      ]}
    >
      <View accessible={false} style={[styles.accent, { backgroundColor: colors.primarySolid }]} />
      <View accessible={false} style={styles.head}>
        <Text accessible={false} style={[typography.labelLg, { color: colors.onSurfaceVariant }]}>
          {label}
        </Text>
        <Dial progress={dialProgress} />
      </View>
      <CountUp
        value={balance}
        format={formatCurrency}
        accessibilityLabel={`${label}: ${balanceText}`}
        style={[typography.displayLg, { color: colors.onSurface }]}
      />
      <View accessible={false} style={[styles.rule, { backgroundColor: colors.strokeStrong }]} />
      <View accessible={false} style={styles.meter}>
        <View accessible={false} style={[styles.meterTrack, { backgroundColor: colors.surfaceContainerHighest }]}>
          <View accessible={false} style={[styles.meterFill, { width: incomeWidth, backgroundColor: colors.success }]} />
        </View>
        <View accessible={false} style={[styles.meterTrack, { backgroundColor: colors.surfaceContainerHighest }]}>
          <View accessible={false} style={[styles.meterFill, { width: expenseWidth, backgroundColor: colors.error }]} />
        </View>
      </View>
      <View accessible={false} style={styles.legend}>
        <Text accessible={false} style={[typography.bodySm, { color: colors.success }]}>
          +{formatCurrency(income)}
        </Text>
        <Text accessible={false} style={[typography.bodySm, { color: colors.error }]}>
          −{formatCurrency(expenses)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderWidth: strokeWidth.thick,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    overflow: 'hidden',
  },
  accent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: strokeWidth.thick,
    backgroundColor: 'transparent',
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rule: { height: strokeWidth.thick, borderRadius: strokeWidth.thick },
  meter: { flexDirection: 'row', gap: spacing.sm },
  meterTrack: { flex: 1, height: 10, borderRadius: borderRadius.full, overflow: 'hidden' },
  meterFill: { height: '100%', borderRadius: borderRadius.full },
  legend: { flexDirection: 'row', justifyContent: 'space-between' },
});
