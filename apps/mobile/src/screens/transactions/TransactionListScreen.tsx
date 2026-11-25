import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { View, Text, Pressable, TouchableOpacity, TextInput, Modal, ScrollView } from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';

import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TransactionCard } from '../../components/ui/TransactionCard';
import { StatePanel } from '../../components/ui/StatePanel';
import { SkeletonLine, SkeletonTransactionRows } from '../../components/ui/Skeleton';
import { Glyph } from '../../components/ui/Glyph';
import { GradientButton } from '../../components/ui/GradientButton';
import { FocusFadeIn } from '../../components/ui/FocusFadeIn';
import { typography, strokeWidth, spacing, borderRadius, layout, outlineColor } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { formatCurrency } from '../../utils/format';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { expensesApi, earningsApi, transactionsApi, categoriesApi, walletsApi } from '../../services/api';
import { useSnackbar } from '../../context/SnackbarContext';
import { showAlert } from '../../components/ui/AppAlert';
import type { RootNavigationProp } from '../../navigation/types';
import type { ThemeColors } from '../../theme';
import type { Expense, Earning, Category, Wallet, TransactionSummary } from '@finance-flow/shared-types';
import type { TransactionTimelineItem } from '@finance-flow/api-client';

type TabType = 'all' | 'expenses' | 'earnings';

type TransactionItem = Expense | Earning | (TransactionTimelineItem & { createdAt: string });

type TransactionSection = {
  title: string;
  data: TransactionItem[];
};

type FilterOverrides = {
  category?: string;
  wallet?: string;
  sortBy?: 'value' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
};

type LoadOverrides = FilterOverrides & { page?: number };

// FlashList has no section API: sections are flattened into a single row list.
type ListRow =
  | { kind: 'header'; key: string; title: string }
  | { kind: 'transaction'; key: string; item: TransactionItem; itemType: 'expense' | 'earning' };

const FILTER_TABS: { key: TabType; label: string; tone?: 'expense' | 'earning' }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'expenses', label: 'Gastos', tone: 'expense' },
  { key: 'earnings', label: 'Ingresos', tone: 'earning' },
];

export function TransactionListScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { showError } = useSnackbar();
  const [tab, setTab] = useState<TabType>('all');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [allTransactions, setAllTransactions] = useState<(TransactionTimelineItem & { createdAt: string })[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [search, setSearch] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialError, setInitialError] = useState(false);
  const hasLoadedRef = useRef(false);

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

  const buildParams = useCallback((overrides?: LoadOverrides) => {
    const params: Record<string, string | number | undefined> = {
      page: overrides?.page ?? 1,
      limit: PAGE_SIZE,
    };
    // Presence checks let an explicit `undefined` clear a filter. `??` would
    // silently fall back to the old state and refetch with stale filters.
    const o = overrides ?? {};
    const has = (key: keyof LoadOverrides) => Object.prototype.hasOwnProperty.call(o, key);
    const cat = has('category') ? o.category : filterCategory;
    const wal = has('wallet') ? o.wallet : filterWallet;
    const sb = has('sortBy') ? o.sortBy : filterSortBy;
    const so = has('sortOrder') ? o.sortOrder : filterSortOrder;
    if (cat) params.category = cat;
    if (wal) params.wallet = wal;
    if (sb) params.sortBy = sb;
    if (so) params.sortOrder = so;
    return params;
  }, [filterCategory, filterWallet, filterSortBy, filterSortOrder]);

  const loadData = useCallback(async (filterOverrides?: FilterOverrides) => {
    try {
      const params = buildParams({ ...filterOverrides, page: 1 });
      // Summary does not depend on the list response; start both now.
      const summaryPromise = transactionsApi.getSummary();

      if (tab === 'all') {
        const [allData, summaryData] = await Promise.all([
          transactionsApi.getAll(params),
          summaryPromise,
        ]);
        const mapped = allData.map(t => ({
          ...t,
          createdAt: t.created_at,
        }));
        setAllTransactions(mapped);
        setAllPage(1);
        setHasMoreAll(allData.length >= PAGE_SIZE);
        setSummary(summaryData);
      } else {
        const [expData, earnData, summaryData] = await Promise.all([
          expensesApi.getAll(params),
          earningsApi.getAll(params),
          summaryPromise,
        ]);
        setExpenses(expData);
        setEarnings(earnData);
        setExpensesPage(1);
        setEarningsPage(1);
        setHasMoreExpenses(expData.length >= PAGE_SIZE);
        setHasMoreEarnings(earnData.length >= PAGE_SIZE);
        setSummary(summaryData);
      }
      hasLoadedRef.current = true;
      setInitialError(false);
      setInitialLoading(false);
    } catch {
      showError('Error al cargar transacciones');
      if (!hasLoadedRef.current) setInitialError(true);
    } finally {
      if (!hasLoadedRef.current) setInitialLoading(false);
    }
  }, [tab, buildParams, showError]);

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

  // Keep a ref to the latest loadData so the focus effect only re-runs when
  // the screen is actually focused (not on every filter/tab state change).
  const loadDataRef = useRef(loadData);
  useEffect(() => {
    loadDataRef.current = loadData;
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadMeta();
      loadDataRef.current();
    }, [loadMeta])
  );

  // Reload only when the tab actually changes (skip the mount pass, the focus
  // effect already covers it) to avoid duplicate network requests.
  const isFirstTabRender = useRef(true);
  useEffect(() => {
    if (isFirstTabRender.current) {
      isFirstTabRender.current = false;
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to tab switches
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
    setFilterCategory(undefined);
    setFilterWallet(undefined);
    setFilterSortBy(undefined);
    setFilterSortOrder(undefined);
    loadData({ category: undefined, wallet: undefined, sortBy: undefined, sortOrder: undefined });
  };

  const retryInitialLoad = () => {
    setInitialError(false);
    setInitialLoading(true);
    loadDataRef.current();
  };

  const hasActiveFilters = filterCategory !== undefined || filterWallet !== undefined || filterSortBy !== undefined;

  const data = useMemo(() => {
    if (tab === 'all') return allTransactions;
    return tab === 'expenses' ? expenses : earnings;
  }, [tab, expenses, earnings, allTransactions]);
  const filtered = useMemo(() => data.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  ), [data, search]);

  // Single-pass grouping: builds sections in O(n) instead of 3 filtered passes.
  const sections: TransactionSection[] = useMemo(() => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const todayItems: TransactionItem[] = [];
    const yesterdayItems: TransactionItem[] = [];
    const olderItems: TransactionItem[] = [];
    for (const t of filtered) {
      const d = new Date(t.createdAt).toDateString();
      if (d === today) todayItems.push(t);
      else if (d === yesterday) yesterdayItems.push(t);
      else olderItems.push(t);
    }
    const result: TransactionSection[] = [];
    if (todayItems.length > 0) result.push({ title: 'Hoy', data: todayItems });
    if (yesterdayItems.length > 0) result.push({ title: 'Ayer', data: yesterdayItems });
    if (olderItems.length > 0) result.push({ title: 'Anteriores', data: olderItems });
    return result;
  }, [filtered]);

  const walletsById = useMemo(() => new Map(wallets.map((w) => [w.id, w.name])), [wallets]);

  // Flatten sections into rows for FlashList. Keys include the type so an
  // expense and an earning can never collide on the same numeric id.
  const listRows = useMemo<ListRow[]>(() => {
    const rows: ListRow[] = [];
    for (const section of sections) {
      rows.push({ kind: 'header', key: `header-${section.title}`, title: section.title });
      for (const item of section.data) {
        const itemType: 'expense' | 'earning' =
          tab === 'all' ? (item as TransactionTimelineItem).type : (tab === 'expenses' ? 'expense' : 'earning');
        rows.push({ kind: 'transaction', key: `${itemType}-${item.id}`, item, itemType });
      }
    }
    return rows;
  }, [sections, tab]);

  const keyExtractor = useCallback((row: ListRow) => row.key, []);

  const getItemType = useCallback((row: ListRow) => row.kind, []);

  const renderItem: ListRenderItem<ListRow> = useCallback(
    ({ item: row }) => {
      if (row.kind === 'header') {
        return (
          <View style={{ marginTop: spacing.md, marginBottom: spacing.sm }}>
            <Text style={[typography.titleMd, { color: colors.onSurface }]}>
              {row.title}
            </Text>
            <View style={{ height: strokeWidth.medium, backgroundColor: colors.outlineVariant, marginTop: spacing.sm }} />
          </View>
        );
      }
      const { item, itemType } = row;
      const resolvedWalletName = tab === 'all'
        ? walletsById.get((item as TransactionTimelineItem).wallet_id)
        : undefined;
      const isExpense = itemType === 'expense';
      return (
        <TouchableOpacity
          onPress={() => navigation.navigate('TransactionDetail', { transactionId: item.id, type: itemType })}
          onLongPress={() => handleDelete(item)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`${item.name}, ${isExpense ? 'gasto' : 'ingreso'} de ${formatCurrency(item.value)}`}
          accessibilityHint="Toca para ver el detalle. Mantén presionado para eliminar."
        >
          <TransactionCard
            transaction={item as Expense | Earning}
            type={itemType}
            walletName={resolvedWalletName}
          />
        </TouchableOpacity>
      );
    },
    [tab, walletsById, navigation, handleDelete, colors]
  );

  const listFooter = useCallback(
    () =>
      loadingMore ? (
        <View
          accessible
          accessibilityRole="text"
          accessibilityLiveRegion="polite"
          accessibilityLabel="Cargando más transacciones"
          style={{ paddingVertical: spacing.md }}
        >
          <SkeletonTransactionRows
            rows={1}
            tone={tab === 'earnings' ? 'earning' : tab === 'expenses' ? 'expense' : 'mixed'}
            label="Cargando más transacciones"
          />
        </View>
      ) : null,
    [loadingMore, tab]
  );

  const listEmpty = useCallback(
    () => (
      <StatePanel
        state="empty"
        title={
          tab === 'all'
            ? 'Aún no hay movimientos'
            : tab === 'expenses'
              ? 'Aún no hay gastos'
              : 'Aún no hay ingresos'
        }
        message="Cuando registres una transacción, aparecerá aquí."
        style={{ marginTop: spacing.lg }}
      />
    ),
    [tab]
  );

  const hasAmountFilters = filterCategory !== undefined || filterWallet !== undefined;

  const totalAmount = useMemo(() => {
    if (hasAmountFilters || !summary) return data.reduce((sum, t) => sum + t.value, 0);
    return tab === 'expenses' ? summary.totalExpenses : summary.totalEarnings;
  }, [data, hasAmountFilters, summary, tab]);
  const allBalance = useMemo(() => {
    if (tab !== 'all') return null;
    if (hasAmountFilters || !summary) {
      const totalExp = allTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.value, 0);
      const totalEarn = allTransactions.filter(t => t.type === 'earning').reduce((s, t) => s + t.value, 0);
      return totalEarn - totalExp;
    }
    return summary.balance;
  }, [tab, allTransactions, hasAmountFilters, summary]);

  const balanceLabel = tab === 'all' ? 'Balance' : tab === 'expenses' ? 'Total gastado' : 'Total recibido';
  const balanceText = tab === 'all'
    ? `${(allBalance ?? 0) >= 0 ? '+' : '-'}${formatCurrency(Math.abs(allBalance ?? 0))}`
    : `${tab === 'expenses' ? '-' : '+'}${formatCurrency(totalAmount)}`;
  const balanceColor = tab === 'all'
    ? ((allBalance ?? 0) >= 0 ? colors.success : colors.error)
    : (tab === 'expenses' ? colors.error : colors.success);

  return (
    <FocusFadeIn>
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          paddingTop: insets.top + spacing.md,
          paddingBottom: spacing.md,
          paddingHorizontal: spacing.container,
          backgroundColor: colors.surface,
          borderBottomWidth: strokeWidth.medium,
          borderBottomColor: colors.outlineVariant,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Glyph name="receipt-outline" tone="primary" size={44} />
          <View style={{ flex: 1 }}>
            <Text style={[typography.headlineMd, { color: colors.onSurface }]}>
              Transacciones
            </Text>
            <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>
              Controla tus movimientos
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: spacing.container }}>
        <View
          style={{
            flexDirection: 'row',
            borderBottomWidth: strokeWidth.medium,
            borderBottomColor: colors.outlineVariant,
          }}
        >
          {FILTER_TABS.map(({ key, label, tone }) => (
            <FilterTab
              key={key}
              label={label}
              tone={tone}
              selected={tab === key}
              onPress={() => setTab(key)}
              colors={colors}
            />
          ))}
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderWidth: strokeWidth.medium,
            borderColor: colors.outlineVariant,
            borderRadius: borderRadius.md,
            paddingHorizontal: spacing.md,
            marginTop: spacing.md,
            marginBottom: spacing.md,
          }}
        >
          <Ionicons name="search" size={18} color={colors.onSurfaceVariant} accessible={false} />
          <TextInput
            placeholder="Buscar transacciones..."
            placeholderTextColor={colors.onSurfaceVariant}
            value={search}
            onChangeText={setSearch}
            accessibilityLabel="Buscar transacciones"
            returnKeyType="search"
            style={[
              typography.bodyMd,
              { flex: 1, color: colors.onSurface, paddingVertical: spacing.sm + 2, marginLeft: spacing.sm },
            ]}
          />
          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            accessibilityRole="button"
            accessibilityLabel={hasActiveFilters ? 'Filtros (activos)' : 'Abrir filtros'}
            accessibilityState={{ expanded: showFilters }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={{ minWidth: layout.touchTarget, minHeight: layout.touchTarget, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons
              name="filter"
              size={18}
              color={hasActiveFilters ? colors.primary : colors.onSurfaceVariant}
              accessible={false}
            />
          </TouchableOpacity>
        </View>

        {hasActiveFilters && (
          <Text style={[typography.bodySm, { color: colors.primary, marginBottom: spacing.sm }]}>
            Filtros activos
          </Text>
        )}

        {initialLoading ? (
          <View
            accessible={false}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: spacing.md,
              borderBottomWidth: strokeWidth.medium,
              borderBottomColor: colors.outlineVariant,
              marginBottom: spacing.sm,
            }}
          >
            <SkeletonLine width="42%" height={15} />
            <SkeletonLine width={96} height={17} />
          </View>
        ) : totalAmount > 0 && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: spacing.md,
              borderBottomWidth: strokeWidth.medium,
              borderBottomColor: colors.outlineVariant,
              marginBottom: spacing.sm,
            }}
          >
            <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant }]}>
              {balanceLabel}
            </Text>
            <Text
              accessible
              accessibilityRole="text"
              accessibilityLabel={`${balanceLabel}: ${balanceText}`}
              style={[typography.titleLg, { color: balanceColor, fontVariant: ['tabular-nums'] }]}
            >
              {balanceText}
            </Text>
          </View>
        )}

        {initialError ? (
          <StatePanel
            state="error"
            title="No pudimos cargar tus transacciones"
            message="Revisa tu conexión e inténtalo de nuevo."
            actionLabel="Reintentar"
            onAction={retryInitialLoad}
          />
        ) : initialLoading ? (
          <SkeletonTransactionRows
            rows={4}
            tone={tab === 'earnings' ? 'earning' : tab === 'expenses' ? 'expense' : 'mixed'}
            label="Cargando transacciones…"
          />
        ) : (
          <FlashList
            data={listRows}
            keyExtractor={keyExtractor}
            getItemType={getItemType}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: spacing['2xl'] }}
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={listFooter}
            ListEmptyComponent={listEmpty}
          />
        )}
      </View>

      <Modal visible={showFilters} transparent animationType="slide" onRequestClose={() => setShowFilters(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View
            accessible={false}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: isDark ? colors.surfaceContainerLowest : colors.onSurface,
              opacity: 0.8,
            }}
          />
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopWidth: strokeWidth.medium,
              borderTopColor: colors.outlineVariant,
              borderTopLeftRadius: borderRadius['2xl'],
              borderTopRightRadius: borderRadius['2xl'],
              padding: spacing.container,
              paddingBottom: spacing['2xl'],
              maxHeight: '70%',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }}>
              <Text style={[typography.titleLg, { color: colors.onSurface }]}>Filtros</Text>
              <TouchableOpacity
                onPress={() => setShowFilters(false)}
                accessibilityRole="button"
                accessibilityLabel="Cerrar filtros"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={{ minWidth: layout.touchTarget, minHeight: layout.touchTarget, alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="close" size={24} color={colors.onSurface} accessible={false} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[typography.titleMd, { color: colors.onSurface, marginBottom: spacing.sm }]}>Categoría</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md }}>
                <TouchableOpacity
                  onPress={() => setFilterCategory(undefined)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: filterCategory === undefined }}
                  accessibilityLabel="Todas las categorías"
                  style={{
                    minHeight: layout.touchTarget,
                    justifyContent: 'center',
                    paddingHorizontal: spacing.md,
                    borderRadius: borderRadius.full,
                    backgroundColor: filterCategory === undefined ? colors.primaryContainer : colors.surfaceContainerHigh,
                    borderWidth: strokeWidth.medium,
                    borderColor: filterCategory === undefined ? colors.primary : colors.outlineVariant,
                  }}
                >
                  <Text style={[typography.labelMd, { color: filterCategory === undefined ? colors.primary : colors.onSurfaceVariant }]}>
                    Todas
                  </Text>
                </TouchableOpacity>
                {categories.map((cat) => {
                  const selected = filterCategory === cat.name;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setFilterCategory(cat.name)}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityLabel={`Categoría ${cat.name}`}
                      style={{
                        minHeight: layout.touchTarget,
                        justifyContent: 'center',
                        paddingHorizontal: spacing.md,
                        borderRadius: borderRadius.full,
                        backgroundColor: selected ? colors.primaryContainer : colors.surfaceContainerHigh,
                        borderWidth: strokeWidth.medium,
                        borderColor: selected ? colors.primary : colors.outlineVariant,
                      }}
                    >
                      <Text style={[typography.labelMd, { color: selected ? colors.primary : colors.onSurfaceVariant }]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[typography.titleMd, { color: colors.onSurface, marginBottom: spacing.sm }]}>Cartera</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.lg }}>
                <TouchableOpacity
                  onPress={() => setFilterWallet(undefined)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: filterWallet === undefined }}
                  accessibilityLabel="Todas las carteras"
                  style={{
                    minHeight: layout.touchTarget,
                    justifyContent: 'center',
                    paddingHorizontal: spacing.md,
                    borderRadius: borderRadius.full,
                    backgroundColor: filterWallet === undefined ? colors.primaryContainer : colors.surfaceContainerHigh,
                    borderWidth: strokeWidth.medium,
                    borderColor: filterWallet === undefined ? colors.primary : colors.outlineVariant,
                  }}
                >
                  <Text style={[typography.labelMd, { color: filterWallet === undefined ? colors.primary : colors.onSurfaceVariant }]}>
                    Todas
                  </Text>
                </TouchableOpacity>
                {wallets.map((w) => {
                  const selected = filterWallet === w.name;
                  return (
                    <TouchableOpacity
                      key={w.id}
                      onPress={() => setFilterWallet(w.name)}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityLabel={`Cartera ${w.name}`}
                      style={{
                        minHeight: layout.touchTarget,
                        justifyContent: 'center',
                        paddingHorizontal: spacing.md,
                        borderRadius: borderRadius.full,
                        backgroundColor: selected ? colors.primaryContainer : colors.surfaceContainerHigh,
                        borderWidth: strokeWidth.medium,
                        borderColor: selected ? colors.primary : colors.outlineVariant,
                      }}
                    >
                      <Text style={[typography.labelMd, { color: selected ? colors.primary : colors.onSurfaceVariant }]}>
                        {w.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[typography.titleMd, { color: colors.onSurface, marginBottom: spacing.sm }]}>Ordenar por</Text>
              <View style={{ flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm }}>
                <TouchableOpacity
                  onPress={() => {
                    setFilterSortBy(filterSortBy === 'value' ? undefined : 'value');
                    setFilterSortOrder('DESC');
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: filterSortBy === 'value' }}
                  accessibilityLabel="Ordenar por monto"
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.xs,
                    minHeight: layout.touchTarget,
                    paddingHorizontal: spacing.md,
                    borderRadius: borderRadius.full,
                    backgroundColor: filterSortBy === 'value' ? colors.primaryContainer : colors.surfaceContainerHigh,
                    borderWidth: strokeWidth.medium,
                    borderColor: filterSortBy === 'value' ? colors.primary : colors.outlineVariant,
                  }}
                >
                  <Ionicons name="cash" size={16} color={filterSortBy === 'value' ? colors.primary : colors.onSurfaceVariant} accessible={false} />
                  <Text style={[typography.labelMd, { color: filterSortBy === 'value' ? colors.primary : colors.onSurfaceVariant }]}>
                    Monto
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setFilterSortBy(filterSortBy === 'createdAt' ? undefined : 'createdAt');
                    setFilterSortOrder('DESC');
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: filterSortBy === 'createdAt' }}
                  accessibilityLabel="Ordenar por fecha"
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.xs,
                    minHeight: layout.touchTarget,
                    paddingHorizontal: spacing.md,
                    borderRadius: borderRadius.full,
                    backgroundColor: filterSortBy === 'createdAt' ? colors.primaryContainer : colors.surfaceContainerHigh,
                    borderWidth: strokeWidth.medium,
                    borderColor: filterSortBy === 'createdAt' ? colors.primary : colors.outlineVariant,
                  }}
                >
                  <Ionicons name="calendar" size={16} color={filterSortBy === 'createdAt' ? colors.primary : colors.onSurfaceVariant} accessible={false} />
                  <Text style={[typography.labelMd, { color: filterSortBy === 'createdAt' ? colors.primary : colors.onSurfaceVariant }]}>
                    Fecha
                  </Text>
                </TouchableOpacity>
              </View>

              {filterSortBy && (
                <View style={{ flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.lg }}>
                  <TouchableOpacity
                    onPress={() => setFilterSortOrder('DESC')}
                    accessibilityRole="button"
                    accessibilityState={{ selected: filterSortOrder === 'DESC' }}
                    accessibilityLabel="Mayor a menor"
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.xs,
                      minHeight: layout.touchTarget,
                      paddingHorizontal: spacing.md,
                      borderRadius: borderRadius.full,
                      backgroundColor: filterSortOrder === 'DESC' ? colors.primaryContainer : colors.surfaceContainerHigh,
                      borderWidth: strokeWidth.medium,
                      borderColor: filterSortOrder === 'DESC' ? colors.primary : colors.outlineVariant,
                    }}
                  >
                    <Ionicons name="arrow-down" size={16} color={filterSortOrder === 'DESC' ? colors.primary : colors.onSurfaceVariant} accessible={false} />
                    <Text style={[typography.labelMd, { color: filterSortOrder === 'DESC' ? colors.primary : colors.onSurfaceVariant }]}>
                      Mayor a menor
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFilterSortOrder('ASC')}
                    accessibilityRole="button"
                    accessibilityState={{ selected: filterSortOrder === 'ASC' }}
                    accessibilityLabel="Menor a mayor"
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.xs,
                      minHeight: layout.touchTarget,
                      paddingHorizontal: spacing.md,
                      borderRadius: borderRadius.full,
                      backgroundColor: filterSortOrder === 'ASC' ? colors.primaryContainer : colors.surfaceContainerHigh,
                      borderWidth: strokeWidth.medium,
                      borderColor: filterSortOrder === 'ASC' ? colors.primary : colors.outlineVariant,
                    }}
                  >
                    <Ionicons name="arrow-up" size={16} color={filterSortOrder === 'ASC' ? colors.primary : colors.onSurfaceVariant} accessible={false} />
                    <Text style={[typography.labelMd, { color: filterSortOrder === 'ASC' ? colors.primary : colors.onSurfaceVariant }]}>
                      Menor a mayor
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                <GradientButton
                  title="Limpiar"
                  variant="outlined"
                  onPress={clearFilters}
                  accessibilityLabel="Limpiar filtros"
                  style={{ flex: 1 }}
                />
                <GradientButton
                  title="Aplicar"
                  onPress={applyFilters}
                  accessibilityLabel="Aplicar filtros"
                  style={{ flex: 1 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
    </FocusFadeIn>
  );
}

function FilterTab({
  label,
  tone,
  selected,
  onPress,
  colors,
}: {
  label: string;
  tone?: 'expense' | 'earning';
  selected: boolean;
  onPress: () => void;
  colors: ThemeColors;
}) {
  const [focused, setFocused] = useState(false);
  const semantic = tone === 'expense' ? colors.error : tone === 'earning' ? colors.success : colors.primary;
  return (
    <Pressable
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={`Mostrar ${label.toLowerCase()}`}
      style={({ pressed }) => [
        {
          flex: 1,
          minHeight: layout.touchTarget,
          justifyContent: 'center',
          alignItems: 'center',
          borderBottomWidth: selected ? strokeWidth.thick : 0,
          borderBottomColor: semantic,
          opacity: pressed ? 0.8 : 1,
        },
        focused ? outlineColor(semantic) : undefined,
      ]}
    >
      <Text
        style={[
          typography.labelLg,
          {
            color: tone ? semantic : (selected ? colors.primary : colors.onSurfaceVariant),
            fontWeight: selected ? '700' : '500',
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
