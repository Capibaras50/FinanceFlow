import { useState, useCallback, useMemo, type ComponentProps } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { TransactionCard } from '../../components/ui/TransactionCard';
import { FocusFadeIn } from '../../components/ui/FocusFadeIn';
import { BalanceHero } from '../../components/ui/BalanceHero';
import { Glyph, type GlyphTone } from '../../components/ui/Glyph';
import { SkeletonDebtSummary, SkeletonHero, SkeletonTransactionRows } from '../../components/ui/Skeleton';
import { typography, spacing, borderRadius, layout, strokeWidth, outlineColor } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useFocusReload } from '../../hooks/useFocusReload';
import { formatCurrency } from '../../utils/format';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../context/SnackbarContext';
import { expensesApi, earningsApi, walletsApi, debtsApi, contactsApi } from '../../services/api';
import type { RootNavigationProp } from '../../navigation/types';
import type { Expense, Earning, WalletBalance, DebtSummary } from '@finance-flow/shared-types';

type PressableBaseProps = ComponentProps<typeof Pressable>;

interface LedgerPressableProps extends Omit<PressableBaseProps, 'style' | 'onFocus' | 'onBlur'> {
  style?: StyleProp<ViewStyle>;
  onFocus?: PressableBaseProps['onFocus'];
  onBlur?: PressableBaseProps['onBlur'];
}

/** Press/focus feedback that keeps the web keyboard ring visible. */
function LedgerPressable({ style, onFocus, onBlur, ...rest }: LedgerPressableProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      {...rest}
      onFocus={(event) => { setFocused(true); onFocus?.(event); }}
      onBlur={(event) => { setFocused(false); onBlur?.(event); }}
      style={({ pressed }) => [
        style,
        pressed ? { opacity: 0.82, transform: [{ scale: 0.985 }] } : undefined,
        focused ? outlineColor(colors.primary) : undefined,
      ]}
    >
      {rest.children}
    </Pressable>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showError } = useSnackbar();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [balanceData, setBalanceData] = useState<WalletBalance[]>([]);
  const [debtSummary, setDebtSummary] = useState<DebtSummary | null>(null);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [balData, expData, earnData, summaryData, pendingData] = await Promise.all([
        walletsApi.getBalance(),
        expensesApi.getAll({ sortBy: 'createdAt', sortOrder: 'DESC', limit: 5 }),
        earningsApi.getAll({ sortBy: 'createdAt', sortOrder: 'DESC', limit: 5 }),
        debtsApi.getSummary(),
        contactsApi.getPendingReceivedCount(),
      ]);
      setBalanceData(balData);
      setExpenses(expData);
      setEarnings(earnData);
      setDebtSummary(summaryData);
      setPendingRequests(pendingData.count);
    } catch {
      showError('Error al cargar datos del inicio');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useFocusReload(loadData);

  const totalEarnings = useMemo(() => balanceData.reduce((sum, w) => sum + Number(w.totalEarnings), 0), [balanceData]);
  const totalExpenses = useMemo(() => balanceData.reduce((sum, w) => sum + Number(w.totalExpenses), 0), [balanceData]);
  const balance = useMemo(() => totalEarnings - totalExpenses, [totalEarnings, totalExpenses]);

  const recentTransactions = useMemo(() =>
    [...expenses.map(e => ({ ...e, _type: 'expense' as const })),
    ...earnings.map(e => ({ ...e, _type: 'earning' as const })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [expenses, earnings]
  );

  const { receivableDebtsTotal, payableDebtsTotal } = useMemo(() => {
    if (!debtSummary) return { receivableDebtsTotal: 0, payableDebtsTotal: 0 };
    return {
      receivableDebtsTotal: Number(debtSummary.receivableTotal),
      payableDebtsTotal: Number(debtSummary.payableTotal),
    };
  }, [debtSummary]);
  const hasOutstandingDebts = receivableDebtsTotal > 0 || payableDebtsTotal > 0;

  const quickActions: Array<{
    label: string;
    icon: 'add-circle' | 'remove-circle' | 'qr-code' | 'sparkles';
    tone: GlyphTone;
    accessibilityLabel: string;
    onPress: () => void;
  }> = [
    { label: 'Ingresos', icon: 'add-circle', tone: 'success', accessibilityLabel: 'Registrar ingreso', onPress: () => navigation.navigate('AddEarning') },
    { label: 'Gastos', icon: 'remove-circle', tone: 'error', accessibilityLabel: 'Registrar gasto', onPress: () => navigation.navigate('AddExpense') },
    { label: 'Escanear', icon: 'qr-code', tone: 'primary', accessibilityLabel: 'Escanear recibo', onPress: () => navigation.navigate('ReceiptScanner') },
    { label: 'IA Chat', icon: 'sparkles', tone: 'info', accessibilityLabel: 'Abrir chat con IA', onPress: () => navigation.navigate('Chat') },
  ];

  const divider = { height: strokeWidth.thick, backgroundColor: colors.strokeStrong, borderRadius: strokeWidth.thick };

  return (
    <FocusFadeIn>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing['2xl'] }}
        >
          <View
            style={{
              width: '100%',
              maxWidth: layout.contentMaxWidth,
              alignSelf: 'center',
              paddingTop: insets.top + spacing.md,
              paddingHorizontal: spacing.container,
              gap: spacing.xl,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm }}>
              <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Glyph name="wallet" tone="primary" size={48} style={{ flexShrink: 0 }} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[typography.labelLg, { color: colors.onSurfaceVariant }]}
                  >
                    Finance Flow
                  </Text>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[typography.headlineSm, { color: colors.onSurface }]}
                  >
                    ¡Hola, {user?.profile?.name || 'Usuario'}!
                  </Text>
                </View>
              </View>
              <LedgerPressable
                onPress={() => navigation.navigate('Contacts')}
                accessibilityRole="button"
                accessibilityLabel={
                  pendingRequests > 0
                    ? `Notificaciones, ${pendingRequests} solicitudes pendientes`
                    : 'Notificaciones'
                }
                hitSlop={8}
                style={{ flexShrink: 0, borderRadius: borderRadius.md }}
              >
                <Glyph
                  name="notifications"
                  tone="primary"
                  size={48}
                  badge={pendingRequests > 0 ? pendingRequests : undefined}
                />
              </LedgerPressable>
            </View>

            {/* The single orchestrated moment: a safe door that turns and counts. */}
            {loading ? (
              <SkeletonHero label="Cargando saldo" />
            ) : (
              <BalanceHero balance={balance} income={totalEarnings} expenses={totalExpenses} />
            )}

            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {quickActions.map((action) => (
                <LedgerPressable
                  key={action.label}
                  onPress={action.onPress}
                  accessibilityRole="button"
                  accessibilityLabel={action.accessibilityLabel}
                  style={{ flex: 1, alignItems: 'center', gap: spacing.sm, minHeight: 74 }}
                >
                  <Glyph name={action.icon} tone={action.tone} size={48} />
                  <Text style={[typography.labelMd, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
                    {action.label}
                  </Text>
                </LedgerPressable>
              ))}
            </View>

            <View style={divider} />

            <View style={{ gap: spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[typography.headlineSm, { color: colors.onSurface }]}>
                  Deudas pendientes
                </Text>
                <LedgerPressable
                  onPress={() => navigation.navigate('Debts')}
                  accessibilityRole="button"
                  accessibilityLabel="Ver todas las deudas"
                  hitSlop={8}
                >
                  <Text style={[typography.labelLg, { color: colors.primary }]}>Ver todas</Text>
                </LedgerPressable>
              </View>
              {loading ? (
                <SkeletonDebtSummary label="Cargando deudas" />
              ) : hasOutstandingDebts ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    backgroundColor: colors.surface,
                    borderWidth: strokeWidth.medium,
                    borderColor: colors.stroke,
                    borderRadius: borderRadius.md,
                    padding: spacing.md,
                  }}
                >
                  <View style={{ flex: 1, gap: spacing.xs }}>
                    <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>Me deben</Text>
                    <Text style={[typography.titleLg, { color: colors.success, fontVariant: ['tabular-nums'] }]}>
                      {formatCurrency(receivableDebtsTotal)}
                    </Text>
                  </View>
                  <View style={{ width: strokeWidth.medium, backgroundColor: colors.strokeStrong, marginHorizontal: spacing.lg }} />
                  <View style={{ flex: 1, gap: spacing.xs }}>
                    <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>Debo</Text>
                    <Text style={[typography.titleLg, { color: colors.error, fontVariant: ['tabular-nums'] }]}>
                      {formatCurrency(payableDebtsTotal)}
                    </Text>
                  </View>
                </View>
              ) : (
                <LedgerPressable
                  onPress={() => navigation.navigate('AddDebt')}
                  accessibilityRole="button"
                  accessibilityLabel="Crear deuda"
                  style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: layout.touchTarget }}
                >
                  <Glyph name="add-circle" tone="primary" size={44} />
                  <View>
                    <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant }]}>
                      No tienes deudas pendientes
                    </Text>
                    <Text style={[typography.labelLg, { color: colors.primary }]}>Crear deuda</Text>
                  </View>
                </LedgerPressable>
              )}
            </View>

            <View style={divider} />

            <View style={{ gap: spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[typography.headlineSm, { color: colors.onSurface }]}>
                  Últimas transacciones
                </Text>
                <LedgerPressable
                  onPress={() => navigation.navigate('MainTabs', { screen: 'Transactions' })}
                  accessibilityRole="button"
                  accessibilityLabel="Ver todas las transacciones"
                  hitSlop={8}
                >
                  <Text style={[typography.labelLg, { color: colors.primary }]}>Ver todo</Text>
                </LedgerPressable>
              </View>
              {loading ? (
                <SkeletonTransactionRows rows={5} tone="mixed" label="Cargando transacciones" />
              ) : recentTransactions.length === 0 ? (
                <View
                  accessible
                  accessibilityRole="text"
                  style={{
                    alignItems: 'center',
                    paddingVertical: spacing.xl,
                    borderRadius: borderRadius.md,
                    borderWidth: strokeWidth.medium,
                    borderColor: colors.stroke,
                    backgroundColor: colors.surface,
                  }}
                >
                  <Glyph name="receipt-outline" tone="neutral" size={48} />
                  <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant, textAlign: 'center', marginTop: spacing.md }]}>
                    No hay transacciones aún
                  </Text>
                </View>
              ) : (
                <View style={{ gap: spacing.sm }}>
                  {recentTransactions.map((t) => (
                    <LedgerPressable
                      key={`${t._type}-${t.id}`}
                      onPress={() => navigation.navigate('TransactionDetail', { transactionId: t.id, type: t._type })}
                      accessibilityRole="button"
                      accessibilityLabel={`Ver detalle de ${t.name}`}
                    >
                      <TransactionCard transaction={t} type={t._type} />
                    </LedgerPressable>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </FocusFadeIn>
  );
}
