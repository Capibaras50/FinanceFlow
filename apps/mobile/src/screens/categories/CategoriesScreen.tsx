import { useState, useCallback, useMemo, useRef, useEffect, type ComponentProps } from 'react';
import { View, Text, Pressable, Modal, type StyleProp, type ViewStyle, type TextStyle } from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography, strokeWidth, spacing, borderRadius, layout, outlineColor } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { Input } from '../../components/ui/Input';
import { GradientButton } from '../../components/ui/GradientButton';
import { SkeletonCategoryRows, SkeletonCategorySummary } from '../../components/ui/Skeleton';
import { Glyph } from '../../components/ui/Glyph';
import { categoriesApi } from '../../services/api';
import { useSnackbar } from '../../context/SnackbarContext';
import { showAlert } from '../../components/ui/AppAlert';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { RootNavigationProp } from '../../navigation/types';
import { formatCurrency } from '../../utils/format';
import { goBackOrHome } from '../../utils/navigation';
import type { Category, CategoryBreakdownItem } from '@finance-flow/shared-types';

type PressableBaseProps = ComponentProps<typeof Pressable>;

interface LedgerPressableProps extends Omit<PressableBaseProps, 'style' | 'onFocus' | 'onBlur'> {
  style?: StyleProp<ViewStyle>;
  onFocus?: PressableBaseProps['onFocus'];
  onBlur?: PressableBaseProps['onBlur'];
}

/** Quiet press/focus feedback that keeps the web keyboard ring visible. */
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
        pressed ? { opacity: 0.88 } : undefined,
        focused ? outlineColor(colors.primary) : undefined,
      ]}
    >
      {rest.children}
    </Pressable>
  );
}

const tabularNumbers: TextStyle['fontVariant'] = ['tabular-nums'];

type FilterType = 'all' | 'expense' | 'earning';

export function CategoriesScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showError } = useSnackbar();
  const PAGE_SIZE = 100;

  // Swatches come from the active theme tokens; the stored category colour is
  // user data and is always rendered as a solid token-free value.
  const presetColors = useMemo(
    () => [
      colors.primary,
      colors.secondary,
      colors.success,
      colors.error,
      colors.tertiary,
      colors.inversePrimary,
      colors.primaryContainer,
      colors.secondaryContainer,
      colors.tertiaryContainer,
      colors.onSurfaceVariant,
      colors.onPrimaryContainer,
      colors.onSecondaryContainer,
    ],
    [colors]
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [breakdown, setBreakdown] = useState<CategoryBreakdownItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState<string>(presetColors[0]);
  const [formType, setFormType] = useState<'expense' | 'earning'>('expense');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  const loadFirstPage = useCallback(async () => {
    try {
      const [catData, brkData] = await Promise.all([
        categoriesApi.getAll({ limit: PAGE_SIZE, page: 1 }),
        categoriesApi.getBreakdown(),
      ]);
      const seen = new Set<number>();
      const unique = catData.filter(c => {
        if (seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
      });
      setCategories(unique);
      setBreakdown(brkData);
      setPage(1);
      setHasMore(catData.length >= PAGE_SIZE);
    } catch {
      showError('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const loadFirstPageRef = useRef(loadFirstPage);
  useEffect(() => {
    loadFirstPageRef.current = loadFirstPage;
  }, [loadFirstPage]);

  useFocusEffect(
    useCallback(() => { loadFirstPageRef.current(); }, [])
  );

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const newData = await categoriesApi.getAll({ limit: PAGE_SIZE, page: nextPage });
      setCategories(prev => {
        const seen = new Set(prev.map(c => c.id));
        return [...prev, ...newData.filter(c => {
          if (seen.has(c.id)) return false;
          seen.add(c.id);
          return true;
        })];
      });
      setPage(nextPage);
      if (newData.length < PAGE_SIZE) setHasMore(false);
    } catch {
      showError('Error al cargar más categorías');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, showError]);

  const getCategoryTransactionCount = useCallback(
    (catId: number) =>
      breakdown.reduce((sum, item) => sum + (item.categoryId === catId ? item.count : 0), 0),
    [breakdown]
  );

  const filteredCategories = useMemo(() =>
    filterType === 'all'
      ? categories
      : categories.filter(c => c.type === filterType),
    [categories, filterType]
  );

  const totalExpenses = useMemo(
    () => breakdown.filter(i => i.type === 'expense').reduce((sum, i) => sum + Number(i.value), 0),
    [breakdown]
  );
  const totalEarnings = useMemo(
    () => breakdown.filter(i => i.type === 'earning').reduce((sum, i) => sum + Number(i.value), 0),
    [breakdown]
  );
  const totalBalance = totalEarnings - totalExpenses;

  const summaryLabel = filterType === 'all'
    ? 'Balance general'
    : filterType === 'expense' ? 'Total gastado' : 'Total recibido';

  const summaryValue = filterType === 'all'
    ? totalBalance
    : filterType === 'expense' ? totalExpenses : totalEarnings;

  // Expenses read red, earnings green, and the overall balance follows its sign.
  const summaryColor = filterType === 'expense'
    ? colors.error
    : filterType === 'earning'
      ? colors.success
      : summaryValue < 0 ? colors.error : summaryValue > 0 ? colors.success : colors.onSurface;

  const openCreate = useCallback(() => {
    setEditCategory(null);
    setFormName('');
    setFormDescription('');
    setFormColor(presetColors[0]);
    setFormType('expense');
    setModalVisible(true);
  }, [presetColors]);

  const openEdit = useCallback((cat: Category) => {
    setEditCategory(cat);
    setFormName(cat.name);
    setFormDescription(cat.description || '');
    setFormColor(cat.color);
    setFormType(cat.type);
    setModalVisible(true);
  }, []);

  const handleDelete = useCallback((cat: Category) => {
    const totalTx = getCategoryTransactionCount(cat.id);
    if (totalTx > 0) {
      showAlert({
        title: 'Eliminar categoría',
        message: `Si borras "${cat.name}", también se eliminarán todas las transacciones asociadas a esta categoría.`,
        buttons: [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar todo',
            style: 'destructive',
            onPress: async () => {
              try {
                await categoriesApi.delete(cat.id);
                loadFirstPage();
              } catch {
                showError('Error al eliminar categoría');
              }
            },
          },
        ],
      });
    } else {
      showAlert({
        title: 'Eliminar categoría',
        message: `¿Eliminar "${cat.name}"?`,
        buttons: [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              try {
                await categoriesApi.delete(cat.id);
                loadFirstPage();
              } catch {
                showError('Error al eliminar categoría');
              }
            },
          },
        ],
      });
    }
  }, [getCategoryTransactionCount, loadFirstPage, showError]);

  const handleSave = async () => {
    if (!formName.trim()) return;
    try {
      if (editCategory) {
        await categoriesApi.update(editCategory.id, { name: formName, description: formDescription || undefined, color: formColor, type: formType });
      } else {
        await categoriesApi.create({ name: formName, description: formDescription || undefined, color: formColor, type: formType });
      }
      setModalVisible(false);
      loadFirstPage();
    } catch {
      showError('Error al guardar categoría');
    }
  };

  type BreakdownEntry = {
    key: string;
    label: string;
    value: number;
    color: string;
    isExpense: boolean;
  };

  const categoryBreakdown = useMemo(() => {
    const entries: BreakdownEntry[] = [];

    for (const item of breakdown) {
      if (filterType === 'expense' && item.type !== 'expense') continue;
      if (filterType === 'earning' && item.type !== 'earning') continue;

      entries.push({
        key: `${item.categoryId}-${item.type}`,
        label: filterType === 'all'
          ? `${item.name} (${item.type === 'expense' ? 'gasto' : 'ingreso'})`
          : item.name,
        value: Number(item.value),
        color: item.color,
        isExpense: item.type === 'expense',
      });
    }

    return entries.sort((a, b) => b.value - a.value);
  }, [breakdown, filterType]);

  const summaryTotal = categoryBreakdown.reduce((sum, item) => sum + item.value, 0);

  const formatAmount = (value: number): string => {
    if (value < 0) return `-${formatCurrency(Math.abs(value))}`;
    return formatCurrency(value);
  };

  // O(1) per-row lookup instead of filtering the breakdown for every row.
  const totalsByCategory = useMemo(() => {
    const map = new Map<number, { expenses: number; earnings: number; count: number }>();
    for (const item of breakdown) {
      const entry = map.get(item.categoryId) ?? { expenses: 0, earnings: 0, count: 0 };
      if (item.type === 'expense') entry.expenses += Number(item.value);
      else entry.earnings += Number(item.value);
      entry.count += item.count;
      map.set(item.categoryId, entry);
    }
    return map;
  }, [breakdown]);

  const keyExtractor = useCallback((item: Category) => item.id.toString(), []);

  const renderCategory: ListRenderItem<Category> = useCallback(
    ({ item }) => {
      const totals = totalsByCategory.get(item.id);
      const catExpenseTotal = totals?.expenses ?? 0;
      const catEarningTotal = totals?.earnings ?? 0;
      const totalTx = totals?.count ?? 0;

      const displayTotal = filterType === 'expense'
        ? catExpenseTotal
        : filterType === 'earning'
          ? catEarningTotal
          : catEarningTotal - catExpenseTotal;
      const rowColor = item.type === 'expense' ? colors.error : colors.success;
      const amountColor = filterType === 'expense'
        ? colors.error
        : filterType === 'earning'
          ? colors.success
          : displayTotal < 0 ? colors.error : displayTotal > 0 ? colors.success : colors.onSurface;

      return (
        <LedgerPressable
          onPress={() => openEdit(item)}
          accessibilityRole="button"
          accessibilityLabel={`Categoría ${item.name}, ${totalTx} transacciones`}
          accessibilityHint="Toca para editar la categoría"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            paddingVertical: spacing.md,
            borderBottomWidth: strokeWidth.medium,
            borderBottomColor: colors.outlineVariant,
          }}
        >
          <View
            accessible={false}
            style={{
              width: 44,
              height: 44,
              borderRadius: borderRadius.md,
              backgroundColor: colors.surfaceContainer,
              borderWidth: strokeWidth.medium,
              borderColor: rowColor,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="folder" size={22} color={item.color} accessible={false} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.titleMd, { color: colors.onSurface }]}>
              {item.name}
            </Text>
            <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>
              {totalTx} transacciones
            </Text>
          </View>
          <Text style={[typography.titleMd, { color: amountColor, fontVariant: tabularNumbers }]}>
            {formatAmount(displayTotal)}
          </Text>
          <LedgerPressable
            onPress={() => handleDelete(item)}
            accessibilityRole="button"
            accessibilityLabel={`Eliminar categoría ${item.name}`}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ padding: spacing.xs }}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </LedgerPressable>
        </LedgerPressable>
      );
    },
    [totalsByCategory, filterType, openEdit, handleDelete, colors]
  );

  const listFooter = useCallback(
    () =>
      loadingMore ? (
        <View style={{ paddingVertical: spacing.md, alignItems: 'center' }}>
          <SkeletonCategoryRows rows={1} label="Cargando más categorías" />
        </View>
      ) : null,
    [loadingMore, colors]
  );

  const listEmpty = useCallback(
    () => (
      <View
        style={{
          alignItems: 'center',
          gap: spacing.sm,
          paddingVertical: spacing['2xl'],
          paddingHorizontal: spacing.lg,
          borderRadius: borderRadius.md,
          borderWidth: strokeWidth.medium,
          borderColor: colors.outlineVariant,
        }}
      >
        <View
          accessible={false}
          style={{
            width: 48,
            height: 48,
            borderRadius: borderRadius.md,
            backgroundColor: colors.surfaceContainer,
            borderWidth: strokeWidth.medium,
            borderColor: colors.outlineVariant,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="apps-outline" size={24} color={colors.onSurfaceVariant} />
        </View>
        <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
          {filterType === 'all'
            ? 'No hay categorías aún'
            : `No hay categorías de ${filterType === 'expense' ? 'gastos' : 'ingresos'}`}
        </Text>
        <GradientButton title="Crear categoría" onPress={openCreate} />
      </View>
    ),
    [colors, filterType, openCreate]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          width: '100%',
          maxWidth: layout.contentMaxWidth,
          alignSelf: 'center',
          paddingTop: insets.top + spacing.md,
          paddingBottom: spacing.md,
          paddingHorizontal: spacing.container,
          backgroundColor: colors.surface,
          borderBottomWidth: strokeWidth.medium,
          borderBottomColor: colors.outlineVariant,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <LedgerPressable
            onPress={() => goBackOrHome(navigation)}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
          </LedgerPressable>
          <Glyph name="apps" tone="primary" size={44} />
          <Text style={[typography.headlineMd, { color: colors.onSurface, flex: 1 }]}>
            Categorías
          </Text>
          <LedgerPressable
            onPress={openCreate}
            accessibilityRole="button"
            accessibilityLabel="Crear categoría"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="add-circle" size={28} color={colors.primary} />
          </LedgerPressable>
        </View>
      </View>

      <FlashList
        data={filteredCategories}
        keyExtractor={keyExtractor}
        renderItem={renderCategory}
        contentContainerStyle={{
          padding: spacing.container,
          width: '100%',
          maxWidth: layout.contentMaxWidth,
          alignSelf: 'center',
        }}
        ListHeaderComponent={() => (
          <>
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: colors.surfaceContainer,
                borderRadius: borderRadius.full,
                borderWidth: strokeWidth.medium,
                borderColor: colors.outlineVariant,
                padding: spacing.xs,
                marginBottom: spacing.lg,
              }}
            >
              {([
                { key: 'all', label: 'Todos', tone: colors.primary, tint: colors.primaryContainer, semantic: false },
                { key: 'expense', label: 'Gastos', tone: colors.error, tint: colors.errorContainer, semantic: true },
                { key: 'earning', label: 'Ingresos', tone: colors.success, tint: colors.successContainer, semantic: true },
              ] as const).map((t) => {
                const active = filterType === t.key;
                return (
                  <LedgerPressable
                    key={t.key}
                    onPress={() => setFilterType(t.key)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`Mostrar ${t.label.toLowerCase()}`}
                    hitSlop={4}
                    style={{
                      flex: 1,
                      minHeight: layout.touchTarget - spacing.xs * 2,
                      paddingVertical: spacing.sm,
                      borderRadius: borderRadius.full,
                      backgroundColor: active ? t.tint : 'transparent',
                      borderWidth: strokeWidth.medium,
                      borderColor: active ? t.tone : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={[
                        typography.labelMd,
                        {
                          color: t.semantic ? t.tone : (active ? colors.primary : colors.onSurfaceVariant),
                          fontWeight: active ? '700' : t.semantic ? '600' : '400',
                        },
                      ]}
                    >
                      {t.label}
                    </Text>
                  </LedgerPressable>
                );
              })}
            </View>

            {loading ? (
              <SkeletonCategorySummary rows={3} />
            ) : (
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>{summaryLabel}</Text>
              <Text style={[typography.displayLg, { color: summaryColor, marginTop: spacing.xs, fontVariant: tabularNumbers }]}>
                {formatAmount(summaryValue)}
              </Text>
              <View style={{ height: strokeWidth.medium, backgroundColor: colors.outline, marginTop: spacing.md }} />
              {categoryBreakdown.length > 0 && (
                <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
                  {categoryBreakdown.map((item) => {
                    const percent = summaryTotal > 0 ? (item.value / summaryTotal) * 100 : 0;
                    return (
                      <View key={item.key}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                            <View
                              accessible={false}
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: borderRadius.sm,
                                backgroundColor: item.color,
                              }}
                            />
                            <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>{item.label}</Text>
                          </View>
                          <Text style={[typography.bodySm, { color: item.isExpense ? colors.error : colors.success, fontVariant: tabularNumbers }]}>
                            {item.isExpense ? '-' : '+'}{formatCurrency(item.value)}
                          </Text>
                        </View>
                        <View style={{ height: strokeWidth.medium, borderRadius: borderRadius.full, backgroundColor: colors.surfaceContainerHighest, overflow: 'hidden' }}>
                          <View
                            style={{
                              height: '100%',
                              width: `${Math.min(percent, 100)}%`,
                              borderRadius: borderRadius.full,
                              backgroundColor: item.isExpense ? colors.error : colors.success,
                            }}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
              <Text style={[typography.headlineSm, { color: colors.onSurface }]}>
                Mis Categorías
              </Text>
              <LedgerPressable
                onPress={openCreate}
                accessibilityRole="button"
                accessibilityLabel="Crear categoría"
                hitSlop={8}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                  minHeight: layout.touchTarget,
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.md,
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.full,
                  borderWidth: strokeWidth.medium,
                  borderColor: colors.outline,
                }}
              >
                <Ionicons name="add" size={18} color={colors.primary} />
                <Text style={[typography.labelMd, { color: colors.primary }]}>Añadir</Text>
              </LedgerPressable>
            </View>

            {loading && <SkeletonCategoryRows rows={3} label="Cargando categorías" />}
          </>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={listFooter}
        ListEmptyComponent={loading ? null : listEmpty}
      />

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View
            accessible={false}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: colors.background,
              opacity: 0.7,
            }}
          />
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: borderRadius['2xl'],
              borderTopRightRadius: borderRadius['2xl'],
              borderTopWidth: strokeWidth.medium,
              borderTopColor: colors.outlineVariant,
              padding: spacing.container,
              paddingBottom: insets.bottom + spacing.md,
            }}
          >
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.outlineVariant, alignSelf: 'center', marginBottom: spacing.lg }} />
            <Text style={[typography.titleLg, { color: colors.onSurface, marginBottom: spacing.lg }]}>
              {editCategory ? 'Editar categoría' : 'Nueva categoría'}
            </Text>
            <Input label="Nombre" placeholder="Ej: Comida, Transporte" value={formName} onChangeText={setFormName} />
            <View style={{ height: spacing.md }} />
            <Input label="Descripción" placeholder="Opcional" value={formDescription} onChangeText={setFormDescription} />
            <View style={{ height: spacing.md }} />
            <Text style={[typography.labelMd, { color: colors.onSurfaceVariant, marginLeft: 4, marginBottom: spacing.sm }]}>Tipo</Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
              <LedgerPressable
                onPress={() => setFormType('expense')}
                accessibilityRole="radio"
                accessibilityState={{ selected: formType === 'expense' }}
                accessibilityLabel="Tipo gasto"
                style={{
                  flex: 1,
                  minHeight: layout.touchTarget,
                  paddingVertical: spacing.sm,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: borderRadius.md,
                  borderWidth: strokeWidth.medium,
                  borderColor: formType === 'expense' ? colors.error : colors.outlineVariant,
                  backgroundColor: formType === 'expense' ? colors.errorContainer : colors.surfaceContainer,
                }}
              >
                <Text style={[typography.labelMd, { color: formType === 'expense' ? colors.error : colors.onSurfaceVariant }]}>
                  Gasto
                </Text>
              </LedgerPressable>
              <LedgerPressable
                onPress={() => setFormType('earning')}
                accessibilityRole="radio"
                accessibilityState={{ selected: formType === 'earning' }}
                accessibilityLabel="Tipo ingreso"
                style={{
                  flex: 1,
                  minHeight: layout.touchTarget,
                  paddingVertical: spacing.sm,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: borderRadius.md,
                  borderWidth: strokeWidth.medium,
                  borderColor: formType === 'earning' ? colors.success : colors.outlineVariant,
                  backgroundColor: formType === 'earning' ? colors.successContainer : colors.surfaceContainer,
                }}
              >
                <Text style={[typography.labelMd, { color: formType === 'earning' ? colors.success : colors.onSurfaceVariant }]}>
                  Ingreso
                </Text>
              </LedgerPressable>
            </View>
            <Text style={[typography.labelMd, { color: colors.onSurfaceVariant, marginLeft: 4, marginBottom: spacing.sm }]}>Color</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {presetColors.map((c, index) => (
                <LedgerPressable
                  key={c}
                  onPress={() => setFormColor(c)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: formColor === c }}
                  accessibilityLabel={`Color ${index + 1}`}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: borderRadius.full,
                    backgroundColor: colors.surfaceContainer,
                    borderWidth: formColor === c ? 2 : strokeWidth.medium,
                    borderColor: formColor === c ? colors.primary : colors.outlineVariant,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <View
                    accessible={false}
                    style={{ width: 24, height: 24, borderRadius: borderRadius.full, backgroundColor: c }}
                  />
                </LedgerPressable>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
              <GradientButton title="Cancelar" variant="outlined" onPress={() => setModalVisible(false)} style={{ flex: 1 }} />
              <GradientButton title="Guardar" onPress={handleSave} style={{ flex: 1 }} disabled={!formName.trim()} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
