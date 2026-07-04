import { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { GlassCard } from '../../components/ui/GlassCard';
import { TransactionCard } from '../../components/ui/TransactionCard';
import { FocusFadeIn } from '../../components/ui/FocusFadeIn';
import { typography, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { formatCurrency } from '../../utils/format';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../context/SnackbarContext';
import { expensesApi, earningsApi, walletsApi } from '../../services/api';
import type { RootNavigationProp } from '../../navigation/types';
import type { Expense, Earning, WalletBalance } from '@finance-flow/shared-types';

export function HomeScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showError } = useSnackbar();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [balanceData, setBalanceData] = useState<WalletBalance[]>([]);

  useFocusEffect(
    useCallback(() => { loadData(); }, [])
  );

  const loadData = async () => {
    try {
      const [balData, expData, earnData] = await Promise.all([
        walletsApi.getBalance(),
        expensesApi.getAll({ sortBy: 'createdAt', sortOrder: 'DESC', limit: 5 }),
        earningsApi.getAll({ sortBy: 'createdAt', sortOrder: 'DESC', limit: 5 }),
      ]);
      setBalanceData(balData);
      setExpenses(expData);
      setEarnings(earnData);
    } catch {
      showError('Error al cargar datos del inicio');
    }
  };

  const totalEarnings = useMemo(() => balanceData.reduce((sum, w) => sum + Number(w.totalEarnings), 0), [balanceData]);
  const totalExpenses = useMemo(() => balanceData.reduce((sum, w) => sum + Number(w.totalExpenses), 0), [balanceData]);
  const balance = useMemo(() => totalEarnings - totalExpenses, [totalEarnings, totalExpenses]);
  const { incomeBarWidth, expenseBarWidth } = useMemo(() => {
    const maxVal = Math.max(totalEarnings, totalExpenses, 1);
    return {
      incomeBarWidth: (totalEarnings / maxVal) * 100,
      expenseBarWidth: (totalExpenses / maxVal) * 100,
    };
  }, [totalEarnings, totalExpenses]);

  const recentTransactions = useMemo(() =>
    [...expenses.map(e => ({ ...e, _type: 'expense' as const })),
    ...earnings.map(e => ({ ...e, _type: 'earning' as const })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [expenses, earnings]
  );

  return (
    <FocusFadeIn>
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing['2xl'] }}
      >
        <View style={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.container, gap: spacing.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <LinearGradient
                colors={colors.gradient.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="wallet" size={22} color="#FFFFFF" />
              </LinearGradient>
              <View>
                <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>
                  Finance Flow
                </Text>
                <Text style={[typography.titleMd, { color: colors.onSurface }]}>
                  ¡Hola, {user?.profile?.name || 'Usuario'}!
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Chat')}
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: colors.surfaceContainerHigh,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: colors.outlineVariant + '60',
              }}
            >
              <Ionicons name="notifications" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <GlassCard glowColor={colors.primary}>
            <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>
              Saldo Total
            </Text>
            <Text style={[typography.displayMd, { color: colors.onSurface, marginTop: spacing.xs }]}>
              {formatCurrency(balance)}
            </Text>
          </GlassCard>

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('AddEarning')}
              style={{ flex: 1, alignItems: 'center', gap: spacing.xs }}
            >
              <LinearGradient
                colors={[colors.success + '25', colors.success + '10']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: colors.success + '30',
                }}
              >
                <Ionicons name="add-circle" size={28} color={colors.success} />
              </LinearGradient>
              <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>Ingresos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('AddExpense')}
              style={{ flex: 1, alignItems: 'center', gap: spacing.xs }}
            >
              <LinearGradient
                colors={[colors.error + '25', colors.error + '10']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: colors.error + '30',
                }}
              >
                <Ionicons name="remove-circle" size={28} color={colors.error} />
              </LinearGradient>
              <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>Gastos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('ReceiptScanner')}
              style={{ flex: 1, alignItems: 'center', gap: spacing.xs }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: colors.primary + '15',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: colors.primary + '30',
                }}
              >
                <Ionicons name="qr-code" size={28} color={colors.primary} />
              </View>
              <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>Escanear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Chat')}
              style={{ flex: 1, alignItems: 'center', gap: spacing.xs }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: colors.secondary + '15',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: colors.secondary + '30',
                }}
              >
                <Ionicons name="sparkles" size={28} color={colors.secondary} />
              </View>
              <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>IA Chat</Text>
            </TouchableOpacity>
          </View>

          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={[typography.titleLg, { color: colors.onSurface }]}>
                Resumen del Mes
              </Text>
            </View>
            <GlassCard>
              <View style={{ gap: spacing.md }}>
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                    <Text style={[typography.bodySm, { color: colors.success }]}>Ingresos</Text>
                    <Text style={[typography.bodySm, { color: colors.success }]}>{formatCurrency(totalEarnings)}</Text>
                  </View>
                  <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.surfaceContainerHighest, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: `${incomeBarWidth}%`, borderRadius: 4, backgroundColor: colors.success, opacity: 0.7 }} />
                  </View>
                </View>
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                    <Text style={[typography.bodySm, { color: colors.error }]}>Gastos</Text>
                    <Text style={[typography.bodySm, { color: colors.error }]}>{formatCurrency(totalExpenses)}</Text>
                  </View>
                  <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.surfaceContainerHighest, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: `${expenseBarWidth}%`, borderRadius: 4, backgroundColor: colors.error, opacity: 0.7 }} />
                  </View>
                </View>
              </View>
            </GlassCard>
          </View>

          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={[typography.titleLg, { color: colors.onSurface }]}>
                Últimas Transacciones
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Transactions' })}>
                <Text style={[typography.bodySm, { color: colors.primary }]}>Ver todo</Text>
              </TouchableOpacity>
            </View>
            {recentTransactions.length === 0 ? (
              <GlassCard>
                <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
                  No hay transacciones aún
                </Text>
              </GlassCard>
            ) : (
              recentTransactions.map((t, i) => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => navigation.navigate('TransactionDetail', { transactionId: t.id, type: t._type })}
                >
                  <TransactionCard transaction={t} type={t._type} />
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
    </FocusFadeIn>
  );
}
