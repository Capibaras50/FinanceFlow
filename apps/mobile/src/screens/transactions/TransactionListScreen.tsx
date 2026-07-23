import { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, SectionList, Modal, ScrollView } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '../../components/ui/GlassCard';
import { TransactionCard } from '../../components/ui/TransactionCard';
import { FocusFadeIn } from '../../components/ui/FocusFadeIn';
import { typography, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { formatCurrency } from '../../utils/format';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { expensesApi, earningsApi, transactionsApi, categoriesApi, walletsApi } from '../../services/api';
import { useSnackbar } from '../../context/SnackbarContext';
import { showAlert } from '../../components/ui/AppAlert';
import type { RootNavigationProp } from '../../navigation/types';
import type { Expense, Earning, Category, Wallet } from '@finance-flow/shared-types';
import type { TransactionTimelineItem } from '@finance-flow/api-client';

type TabType = 'all' | 'expenses' | 'earnings';

type TransactionSection = {
  title: string;
  data: (Expense | Earning | (TransactionTimelineItem & { createdAt: string }))[];
};

export function TransactionListScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showError } = useSnackbar();
  const [tab, setTab] = useState<TabType>('all');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [allTransactions, setAllTransactions] = useState<(TransactionTimelineItem & { createdAt: string })[]>([]);
  const [search, setSearch] = useState('');

  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [filterCategory, setFilterCategory] = useState<string | undefined>();
  const [filterWallet, setFilterWallet] = useState<string | undefined>();
  const [filterSortBy, setFilterSortBy] = useState<'value' | 'createdAt' | undefined>();
  const [filterSortOrder, setFilterSortOrder] = useState<'ASC' | 'DESC' | undefined>();

  const PAGE_SIZE = 10;
  const [expensesPage, setExpensesPage] = useState(1);
  const [earningsPage, setEarningsPage] = useState(1);
  const [allPage, setAllPage] = useState(1);
  const [hasMoreExpenses, setHasMoreExpenses] = useState(true);
  const [hasMoreEarnings, setHasMoreEarnings] = useState(true);
  const [hasMoreAll, setHasMoreAll] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMeta = useCallback(async () => {
    try {
      const [cats, wals] = await Promise.all([
        categoriesApi.getAll({ limit: 100 }),
        walletsApi.getAll({ limit: 100 }),
      ]);
      setCategories(cats);
      setWallets(wals);
    } catch {}
  }, []);

  const buildParams = (overrides?: { page?: number; category?: string; wallet?: string; sortBy?: 'value' | 'createdAt'; sortOrder?: 'ASC' | 'DESC' }) => {
    const params: Record<string, string | number | undefined> = {
      page: overrides?.page ?? 1,
      limit: PAGE_SIZE,
    };
    const cat = overrides?.category ?? filterCategory;
    const wal = overrides?.wallet ?? filterWallet;
    const sb = overrides?.sortBy ?? filterSortBy;
    const so = overrides?.sortOrder ?? filterSortOrder;
    if (cat) params.category = cat;
    if (wal) params.wallet = wal;
    if (sb) params.sortBy = sb;
    if (so) params.sortOrder = so;
    return params;
  };

  const loadData = useCallback(async (filterOverrides?: { category?: string; wallet?: string; sortBy?: 'value' | 'createdAt'; sortOrder?: 'ASC' | 'DESC' }) => {
    try {
      const params = buildParams({ ...filterOverrides, page: 1 });

      if (tab === 'all') {
        const allData = await transactionsApi.getAll(params);
        const mapped = allData.map(t => ({
          ...t,
          createdAt: t.created_at,
        }));
        setAllTransactions(mapped);
        setAllPage(1);
        setHasMoreAll(allData.length >= PAGE_SIZE);
      } else {
        const [expData, earnData] = await Promise.all([
          expensesApi.getAll(params),
          earningsApi.getAll(params),
        ]);
        setExpenses(expData);
        setEarnings(earnData);
        setExpensesPage(1);
        setEarningsPage(1);
        setHasMoreExpenses(expData.length >= PAGE_SIZE);
        setHasMoreEarnings(earnData.length >= PAGE_SIZE);
      }
    } catch {
      showError('Error al cargar transacciones');
    }
  }, [tab, filterCategory, filterWallet, filterSortBy, filterSortOrder, showError]);

  const loadMore = async () => {
    if (loadingMore) return;

    if (tab === 'all') {
      const hasMore = hasMoreAll;
      if (!hasMore) return;
      const nextPage = allPage + 1;
      setLoadingMore(true);
      try {
        const params = buildParams({ page: nextPage });
        const newData = await transactionsApi.getAll(params);
        const mapped = newData.map(t => ({
          ...t,
          createdAt: t.created_at,
        }));
        setAllTransactions(prev => [...prev, ...mapped]);
        setAllPage(nextPage);
        if (newData.length < PAGE_SIZE) setHasMoreAll(false);
      } catch {
        showError('Error al cargar más transacciones');
      } finally {
        setLoadingMore(false);
      }
      return;
    }

    const nextPage = (tab === 'expenses' ? expensesPage : earningsPage) + 1;
    const hasMore = tab === 'expenses' ? hasMoreExpenses : hasMoreEarnings;
    if (!hasMore) return;

    setLoadingMore(true);
    try {
      const params = buildParams({ page: nextPage });
      if (tab === 'expenses') {
        const newData = await expensesApi.getAll(params);
        setExpenses(prev => [...prev, ...newData]);
        setExpensesPage(nextPage);
        if (newData.length < PAGE_SIZE) setHasMoreExpenses(false);
      } else {
        const newData = await earningsApi.getAll(params);
        setEarnings(prev => [...prev, ...newData]);
        setEarningsPage(nextPage);
        if (newData.length < PAGE_SIZE) setHasMoreEarnings(false);
      }
    } catch {
      showError('Error al cargar más transacciones');
    } finally {
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMeta();
      loadData();
    }, [loadMeta, loadData])
  );

  useEffect(() => {
    loadData();
  }, [tab]);

  const handleDelete = useCallback(async (item: Expense | Earning | (TransactionTimelineItem & { createdAt: string })) => {
    showAlert({
      title: 'Eliminar transacción',
      message: `¿Eliminar "${item.name}"?`,
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              if (tab === 'all') {
                const t = item as TransactionTimelineItem;
                if (t.type === 'expense') {
                  await expensesApi.delete(t.id);
                } else {
                  await earningsApi.delete(t.id);
                }
              } else if (tab === 'expenses') {
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
      ],
    });
  }, [tab, loadData, showError]);

  const applyFilters = () => {
    setShowFilters(false);
    loadData({ category: filterCategory, wallet: filterWallet, sortBy: filterSortBy, sortOrder: filterSortOrder });
  };

  const clearFilters = () => {
    setShowFilters(false);
    loadData({ category: undefined, wallet: undefined, sortBy: undefined, sortOrder: undefined });
    setFilterCategory(undefined);
    setFilterWallet(undefined);
    setFilterSortBy(undefined);
    setFilterSortOrder(undefined);
  };

  const hasActiveFilters = filterCategory !== undefined || filterWallet !== undefined || filterSortBy !== undefined;

  const data = useMemo(() => {
    if (tab === 'all') return allTransactions;
    return tab === 'expenses' ? expenses : earnings;
  }, [tab, expenses, earnings, allTransactions]);
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
  }, [filtered, wallets]);

  const totalAmount = useMemo(() => data.reduce((sum, t) => sum + t.value, 0), [data]);
  const allBalance = useMemo(() => {
    if (tab !== 'all') return null;
    const totalExp = allTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.value, 0);
    const totalEarn = allTransactions.filter(t => t.type === 'earning').reduce((s, t) => s + t.value, 0);
    return totalEarn - totalExp;
  }, [tab, allTransactions]);

  return (
    <FocusFadeIn>
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
          {(['all', 'expenses', 'earnings'] as const).map((t) => (
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
                {t === 'all' ? 'Todos' : t === 'expenses' ? 'Gastos' : 'Ingresos'}
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
          <TouchableOpacity onPress={() => setShowFilters(true)}>
            <Ionicons
              name="filter"
              size={18}
              color={hasActiveFilters ? colors.primary : colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>

        {hasActiveFilters && (
          <Text style={[typography.bodySm, { color: colors.primary, marginBottom: spacing.sm }]}>
            Filtros activos
          </Text>
        )}

        {totalAmount > 0 && (
          <GlassCard style={{ marginBottom: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant }]}>
              {tab === 'all' ? 'Balance' : tab === 'expenses' ? 'Total gastado' : 'Total recibido'}
            </Text>
            {tab === 'all' ? (
              <Text style={[typography.titleLg, { color: (allBalance ?? 0) >= 0 ? colors.success : colors.error }]}>
                {(allBalance ?? 0) >= 0 ? '+' : '-'}{formatCurrency(Math.abs(allBalance ?? 0))}
              </Text>
            ) : (
              <Text style={[typography.titleLg, { color: tab === 'expenses' ? colors.error : colors.success }]}>
                {tab === 'expenses' ? '-' : '+'}{formatCurrency(totalAmount)}
              </Text>
            )}
          </GlassCard>
        )}

        <SectionList
          sections={sections}
          keyExtractor={(item) => `${item.id}-${tab}`}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={[typography.titleMd, { color: colors.onSurface, marginBottom: spacing.sm, marginTop: spacing.md }]}>
              {title}
            </Text>
          )}
          renderItem={({ item }) => {
            const itemType = tab === 'all' ? (item as TransactionTimelineItem).type : (tab === 'expenses' ? 'expense' : 'earning');
            const timelineItem = tab === 'all' ? (item as TransactionTimelineItem) : null;
            const resolvedWalletName = timelineItem
              ? wallets.find(w => w.id === timelineItem.wallet_id)?.name
              : undefined;
            return (
              <TouchableOpacity
                onPress={() => navigation.navigate('TransactionDetail', { transactionId: item.id, type: itemType as 'expense' | 'earning' })}
                onLongPress={() => handleDelete(item)}
                activeOpacity={0.7}
              >
                <TransactionCard
                  transaction={item as Expense | Earning}
                  type={itemType as 'expense' | 'earning'}
                  walletName={resolvedWalletName}
                />
              </TouchableOpacity>
            );
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing['2xl'] }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loadingMore ? (
            <View style={{ paddingVertical: spacing.md, alignItems: 'center' }}>
              <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>Cargando...</Text>
            </View>
          ) : null}
          ListEmptyComponent={
            <GlassCard style={{ marginTop: spacing.lg }}>
              <View style={{ alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md }}>
                <Ionicons name="receipt-outline" size={48} color={colors.onSurfaceVariant} />
                <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
                  {tab === 'all' ? 'No hay transacciones registradas' : `No hay ${tab === 'expenses' ? 'gastos' : 'ingresos'} registrados`}
                </Text>
              </View>
            </GlassCard>
          }
        />
      </View>

      <Modal visible={showFilters} transparent animationType="slide" onRequestClose={() => setShowFilters(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: borderRadius['2xl'],
              borderTopRightRadius: borderRadius['2xl'],
              padding: spacing.container,
              paddingBottom: spacing['2xl'],
              maxHeight: '70%',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }}>
              <Text style={[typography.titleLg, { color: colors.onSurface }]}>Filtros</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[typography.titleMd, { color: colors.onSurface, marginBottom: spacing.sm }]}>Categoría</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md }}>
                <TouchableOpacity
                  onPress={() => setFilterCategory(undefined)}
                  style={{
                    paddingVertical: spacing.xs + 2,
                    paddingHorizontal: spacing.md,
                    borderRadius: borderRadius.full,
                    backgroundColor: filterCategory === undefined ? colors.primary : colors.surfaceContainerHigh,
                  }}
                >
                  <Text style={[typography.labelMd, { color: filterCategory === undefined ? '#FFFFFF' : colors.onSurfaceVariant }]}>
                    Todas
                  </Text>
                </TouchableOpacity>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setFilterCategory(cat.name)}
                    style={{
                      paddingVertical: spacing.xs + 2,
                      paddingHorizontal: spacing.md,
                      borderRadius: borderRadius.full,
                      backgroundColor: filterCategory === cat.name ? cat.color : colors.surfaceContainerHigh,
                    }}
                  >
                    <Text style={[typography.labelMd, { color: filterCategory === cat.name ? '#FFFFFF' : colors.onSurfaceVariant }]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[typography.titleMd, { color: colors.onSurface, marginBottom: spacing.sm }]}>Cartera</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.lg }}>
                <TouchableOpacity
                  onPress={() => setFilterWallet(undefined)}
                  style={{
                    paddingVertical: spacing.xs + 2,
                    paddingHorizontal: spacing.md,
                    borderRadius: borderRadius.full,
                    backgroundColor: filterWallet === undefined ? colors.primary : colors.surfaceContainerHigh,
                  }}
                >
                  <Text style={[typography.labelMd, { color: filterWallet === undefined ? '#FFFFFF' : colors.onSurfaceVariant }]}>
                    Todas
                  </Text>
                </TouchableOpacity>
                {wallets.map((w) => (
                  <TouchableOpacity
                    key={w.id}
                    onPress={() => setFilterWallet(w.name)}
                    style={{
                      paddingVertical: spacing.xs + 2,
                      paddingHorizontal: spacing.md,
                      borderRadius: borderRadius.full,
                      backgroundColor: filterWallet === w.name ? colors.primary : colors.surfaceContainerHigh,
                    }}
                  >
                    <Text style={[typography.labelMd, { color: filterWallet === w.name ? '#FFFFFF' : colors.onSurfaceVariant }]}>
                      {w.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[typography.titleMd, { color: colors.onSurface, marginBottom: spacing.sm }]}>Ordenar por</Text>
              <View style={{ flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm }}>
                <TouchableOpacity
                  onPress={() => {
                    setFilterSortBy(filterSortBy === 'value' ? undefined : 'value');
                    setFilterSortOrder('DESC');
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.xs,
                    paddingVertical: spacing.xs + 2,
                    paddingHorizontal: spacing.md,
                    borderRadius: borderRadius.full,
                    backgroundColor: filterSortBy === 'value' ? colors.primary : colors.surfaceContainerHigh,
                  }}
                >
                  <Ionicons name="cash" size={16} color={filterSortBy === 'value' ? '#FFFFFF' : colors.onSurfaceVariant} />
                  <Text style={[typography.labelMd, { color: filterSortBy === 'value' ? '#FFFFFF' : colors.onSurfaceVariant }]}>
                    Monto
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setFilterSortBy(filterSortBy === 'createdAt' ? undefined : 'createdAt');
                    setFilterSortOrder('DESC');
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.xs,
                    paddingVertical: spacing.xs + 2,
                    paddingHorizontal: spacing.md,
                    borderRadius: borderRadius.full,
                    backgroundColor: filterSortBy === 'createdAt' ? colors.primary : colors.surfaceContainerHigh,
                  }}
                >
                  <Ionicons name="calendar" size={16} color={filterSortBy === 'createdAt' ? '#FFFFFF' : colors.onSurfaceVariant} />
                  <Text style={[typography.labelMd, { color: filterSortBy === 'createdAt' ? '#FFFFFF' : colors.onSurfaceVariant }]}>
                    Fecha
                  </Text>
                </TouchableOpacity>
              </View>

              {filterSortBy && (
                <View style={{ flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.lg }}>
                  <TouchableOpacity
                    onPress={() => setFilterSortOrder('DESC')}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.xs,
                      paddingVertical: spacing.xs + 2,
                      paddingHorizontal: spacing.md,
                      borderRadius: borderRadius.full,
                      backgroundColor: filterSortOrder === 'DESC' ? colors.primary : colors.surfaceContainerHigh,
                    }}
                  >
                    <Ionicons name="arrow-down" size={16} color={filterSortOrder === 'DESC' ? '#FFFFFF' : colors.onSurfaceVariant} />
                    <Text style={[typography.labelMd, { color: filterSortOrder === 'DESC' ? '#FFFFFF' : colors.onSurfaceVariant }]}>
                      Mayor a menor
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFilterSortOrder('ASC')}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.xs,
                      paddingVertical: spacing.xs + 2,
                      paddingHorizontal: spacing.md,
                      borderRadius: borderRadius.full,
                      backgroundColor: filterSortOrder === 'ASC' ? colors.primary : colors.surfaceContainerHigh,
                    }}
                  >
                    <Ionicons name="arrow-up" size={16} color={filterSortOrder === 'ASC' ? '#FFFFFF' : colors.onSurfaceVariant} />
                    <Text style={[typography.labelMd, { color: filterSortOrder === 'ASC' ? '#FFFFFF' : colors.onSurfaceVariant }]}>
                      Menor a mayor
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                <TouchableOpacity
                  onPress={clearFilters}
                  style={{
                    flex: 1,
                    paddingVertical: spacing.md,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: borderRadius.full,
                    borderWidth: 1.5,
                    borderColor: colors.outlineVariant,
                  }}
                >
                  <Text style={[typography.labelMd, { color: colors.onSurfaceVariant, fontWeight: '600' }]}>
                    Limpiar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={applyFilters}
                  style={{
                    flex: 1,
                    paddingVertical: spacing.md,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: borderRadius.full,
                    backgroundColor: colors.primary,
                  }}
                >
                  <Text style={[typography.labelMd, { color: '#FFFFFF', fontWeight: '600' }]}>
                    Aplicar
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
    </FocusFadeIn>
  );
}
