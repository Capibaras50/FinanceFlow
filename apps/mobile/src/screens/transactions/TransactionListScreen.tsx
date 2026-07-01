import { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, SectionList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '../../components/ui/GlassCard';
import { TransactionCard } from '../../components/ui/TransactionCard';
import { typography, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { formatCurrency } from '../../utils/format';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { expensesApi, earningsApi } from '../../services/api';
import { useSnackbar } from '../../context/SnackbarContext';
import type { RootNavigationProp } from '../../navigation/types';
import type { Expense, Earning } from '@finance-flow/shared-types';

type TransactionSection = {
  title: string;
  data: (Expense | (Earning & { _type?: 'earning' }))[];
};

export function TransactionListScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showError } = useSnackbar();
  const [tab, setTab] = useState<'expenses' | 'earnings'>('expenses');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => { loadData(); }, [])
  );

  const loadData = async () => {
    try {
      const [expData, earnData] = await Promise.all([
        expensesApi.getAll(),
        earningsApi.getAll(),
      ]);
      setExpenses(expData);
      setEarnings(earnData);
    } catch {
      showError('Error al cargar transacciones');
    }
  };

  const handleDelete = useCallback(async (item: Expense | Earning) => {
    Alert.alert('Eliminar transacción', `¿Eliminar "${item.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            if (tab === 'expenses') {
            await expensesApi.delete(item.id);
          } else {
            await earningsApi.delete(item.id);
          }
          loadData();
        } catch {
          showError('Error al eliminar transacción');
        }
      },
      },
    ]);
  }, [tab]);

  const data = useMemo(() => tab === 'expenses' ? expenses : earnings, [tab, expenses, earnings]);
  const filtered = useMemo(() => data.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  ), [data, search]);

  const sections: TransactionSection[] = useMemo(() => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    return [
      { title: 'Hoy', data: filtered.filter((t) => new Date(t.createdAt).toDateString() === today) },
      { title: 'Ayer', data: filtered.filter((t) => new Date(t.createdAt).toDateString() === yesterday) },
      { title: 'Anteriores', data: filtered.filter((t) => {
        const d = new Date(t.createdAt).toDateString();
        return d !== today && d !== yesterday;
      }) },
    ].filter(s => s.data.length > 0);
  }, [filtered]);

  const totalAmount = useMemo(() => data.reduce((sum, t) => sum + t.value, 0), [data]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={colors.gradient.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.lg, paddingHorizontal: spacing.container }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <LinearGradient
            colors={colors.gradient.secondary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="receipt" size={22} color="#FFFFFF" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={[typography.headlineMd, { color: '#FFFFFF' }]}>
              Transacciones
            </Text>
            <Text style={[typography.bodySm, { color: 'rgba(255,255,255,0.7)' }]}>
              Controla tus movimientos
            </Text>
          </View>
          <Ionicons name="sparkles" size={22} color="#FFFFFF" />
        </View>
      </LinearGradient>

      <View style={{ flex: 1, paddingHorizontal: spacing.container }}>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: colors.surfaceContainerHigh,
            borderRadius: borderRadius.full,
            padding: spacing.xs,
            marginVertical: spacing.md,
          }}
        >
          {(['expenses', 'earnings'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={{
                flex: 1,
                paddingVertical: spacing.sm + 2,
                borderRadius: borderRadius.full,
                backgroundColor: tab === t ? colors.primary : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text
                style={[
                  typography.labelMd,
                  { color: tab === t ? '#FFFFFF' : colors.onSurfaceVariant, fontWeight: '600' },
                ]}
              >
                {t === 'expenses' ? 'Gastos' : 'Ingresos'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surfaceContainerHigh,
            borderRadius: borderRadius.lg,
            paddingHorizontal: spacing.md,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: colors.outlineVariant + '60',
          }}
        >
          <Ionicons name="search" size={18} color={colors.onSurfaceVariant} />
          <TextInput
            placeholder="Buscar transacciones..."
            placeholderTextColor={colors.onSurfaceVariant}
            value={search}
            onChangeText={setSearch}
            style={[
              typography.bodyMd,
              { flex: 1, color: colors.onSurface, paddingVertical: spacing.sm + 2, marginLeft: spacing.sm },
            ]}
          />
          <TouchableOpacity>
            <Ionicons name="filter" size={18} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {totalAmount > 0 && (
          <GlassCard style={{ marginBottom: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant }]}>
              Total {tab === 'expenses' ? 'gastado' : 'recibido'}
            </Text>
            <Text style={[typography.titleLg, { color: tab === 'expenses' ? colors.error : colors.success }]}>
              {tab === 'expenses' ? '-' : '+'}{formatCurrency(totalAmount)}
            </Text>
          </GlassCard>
        )}

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id.toString()}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={[typography.titleMd, { color: colors.onSurface, marginBottom: spacing.sm, marginTop: spacing.md }]}>
              {title}
            </Text>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('TransactionDetail', { transactionId: item.id, type: tab === 'expenses' ? 'expense' : 'earning' })}
              onLongPress={() => handleDelete(item)}
              activeOpacity={0.7}
            >
              <TransactionCard
                transaction={item}
                type={tab === 'expenses' ? 'expense' : 'earning'}
              />
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing['2xl'] }}
          ListEmptyComponent={
            <GlassCard style={{ marginTop: spacing.lg }}>
              <View style={{ alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md }}>
                <Ionicons name="receipt-outline" size={48} color={colors.onSurfaceVariant} />
                <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
                  No hay {tab === 'expenses' ? 'gastos' : 'ingresos'} registrados
                </Text>
              </View>
            </GlassCard>
          }
        />
      </View>
    </View>
  );
}
