import { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { GlassCard } from '../../components/ui/GlassCard';
import { Input } from '../../components/ui/Input';
import { GradientButton } from '../../components/ui/GradientButton';
import { categoriesApi } from '../../services/api';
import { useSnackbar } from '../../context/SnackbarContext';
import { showAlert } from '../../components/ui/AppAlert';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { RootNavigationProp } from '../../navigation/types';
import { formatCurrency } from '../../utils/format';
import { goBackOrHome } from '../../utils/navigation';
import type { Category, CategoryBreakdownItem } from '@finance-flow/shared-types';

const presetColors = ['#7C3AED', '#EC4899', '#06B6D4', '#4ADE80', '#F59E0B', '#8B5CF6', '#F472B6', '#14B8A6', '#3B82F6', '#EF4444', '#10B981', '#F97316'];

type FilterType = 'all' | 'expense' | 'earning';

export function CategoriesScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showError } = useSnackbar();
  const PAGE_SIZE = 100;
  const [categories, setCategories] = useState<Category[]>([]);
  const [breakdown, setBreakdown] = useState<CategoryBreakdownItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState(presetColors[0]);
  const [formType, setFormType] = useState<'expense' | 'earning'>('expense');
  const [filterType, setFilterType] = useState<FilterType>('all');

  useFocusEffect(
    useCallback(() => { loadFirstPage(); }, [])
  );

  const loadFirstPage = async () => {
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
    }
  };

  const loadMore = async () => {
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
  };

  const getCategoryTransactionCount = (catId: number) =>
    breakdown.reduce((sum, item) => sum + (item.categoryId === catId ? item.count : 0), 0);

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

  const openCreate = () => {
    setEditCategory(null);
    setFormName('');
    setFormDescription('');
    setFormColor(presetColors[0]);
    setFormType('expense');
    setModalVisible(true);
  };

  const openEdit = (cat: Category) => {
    setEditCategory(cat);
    setFormName(cat.name);
    setFormDescription(cat.description || '');
    setFormColor(cat.color);
    setFormType(cat.type);
    setModalVisible(true);
  };

  const handleDelete = (cat: Category) => {
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
  };

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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={colors.gradient.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.lg, paddingHorizontal: spacing.container }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <TouchableOpacity onPress={() => goBackOrHome(navigation)}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="apps" size={20} color="#FFFFFF" />
          </View>
          <Text style={[typography.headlineMd, { color: '#FFFFFF', flex: 1 }]}>
            Categorías
          </Text>
          <TouchableOpacity onPress={openCreate}>
            <Ionicons name="add-circle" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: spacing.container, gap: spacing.md }}
        ListHeaderComponent={() => (
          <>
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: colors.surfaceContainerHigh,
                borderRadius: borderRadius.full,
                padding: spacing.xs,
                marginBottom: spacing.sm,
              }}
            >
              {([
                { key: 'all', label: 'Todos' },
                { key: 'expense', label: 'Gastos' },
                { key: 'earning', label: 'Ingresos' },
              ] as const).map((t) => (
                <TouchableOpacity
                  key={t.key}
                  onPress={() => setFilterType(t.key)}
                  style={{
                    flex: 1,
                    paddingVertical: spacing.sm + 2,
                    borderRadius: borderRadius.full,
                    backgroundColor: filterType === t.key ? colors.primary : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={[
                      typography.labelMd,
                      { color: filterType === t.key ? '#FFFFFF' : colors.onSurfaceVariant, fontWeight: '600' },
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <GlassCard style={{ marginBottom: spacing.md }}>
              <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>{summaryLabel}</Text>
              <Text style={[typography.displayMd, { color: colors.onSurface, marginTop: spacing.xs }]}>
                {formatAmount(summaryValue)}
              </Text>
              {categoryBreakdown.length > 0 && (
                <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
                  {categoryBreakdown.map((item) => {
                    const percent = summaryTotal > 0 ? (item.value / summaryTotal) * 100 : 0;
                    return (
                      <View key={item.key}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                          <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>{item.label}</Text>
                          <Text style={[typography.bodySm, { color: colors.onSurface }]}>
                            {item.isExpense ? '-' : '+'}{formatCurrency(item.value)}
                          </Text>
                        </View>
                        <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.surfaceContainerHighest, overflow: 'hidden' }}>
                          <View style={{ height: '100%', width: `${Math.min(percent, 100)}%`, borderRadius: 3, backgroundColor: item.color }} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </GlassCard>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
              <Text style={[typography.titleLg, { color: colors.onSurface }]}>
                Mis Categorías
              </Text>
              <TouchableOpacity onPress={openCreate}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.primaryContainer, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.full }}>
                  <Ionicons name="add" size={18} color={colors.onPrimaryContainer} />
                  <Text style={[typography.labelMd, { color: colors.onPrimaryContainer }]}>Añadir</Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}
        renderItem={({ item }) => {
          const catExpenseTotal = breakdown
            .filter(i => i.categoryId === item.id && i.type === 'expense')
            .reduce((s, i) => s + Number(i.value), 0);
          const catEarningTotal = breakdown
            .filter(i => i.categoryId === item.id && i.type === 'earning')
            .reduce((s, i) => s + Number(i.value), 0);
          const totalTx = getCategoryTransactionCount(item.id);

          const displayTotal = filterType === 'expense'
            ? catExpenseTotal
            : filterType === 'earning'
              ? catEarningTotal
              : catEarningTotal - catExpenseTotal;

          return (
            <TouchableOpacity onPress={() => openEdit(item)}>
              <GlassCard>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      backgroundColor: item.color + '20',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="folder" size={22} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.titleMd, { color: colors.onSurface }]}>
                      {item.name}
                    </Text>
                    <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>
                      {totalTx} transacciones
                    </Text>
                  </View>
                  <Text style={[typography.titleMd, { color: colors.onSurface }]}>
                    {formatAmount(displayTotal)}
                  </Text>
                  <TouchableOpacity onPress={() => handleDelete(item)} style={{ padding: spacing.xs }}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </GlassCard>
            </TouchableOpacity>
          );
        }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={loadingMore ? (
          <View style={{ paddingVertical: spacing.md, alignItems: 'center' }}>
            <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>Cargando...</Text>
          </View>
        ) : null}
        ListEmptyComponent={
          <GlassCard>
            <View style={{ alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md }}>
              <Ionicons name="apps-outline" size={48} color={colors.onSurfaceVariant} />
              <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
                {filterType === 'all'
                  ? 'No hay categorías aún'
                  : `No hay categorías de ${filterType === 'expense' ? 'gastos' : 'ingresos'}`}
              </Text>
              <GradientButton title="Crear categoría" onPress={openCreate} />
            </View>
          </GlassCard>
        }
      />

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: borderRadius['2xl'], borderTopRightRadius: borderRadius['2xl'], padding: spacing.container, paddingBottom: insets.bottom + spacing.md }}>
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
              <TouchableOpacity
                onPress={() => setFormType('expense')}
                style={{
                  flex: 1,
                  paddingVertical: spacing.sm,
                  alignItems: 'center',
                  borderRadius: borderRadius.full,
                  backgroundColor: formType === 'expense' ? colors.error : colors.surfaceContainerHigh,
                }}
              >
                <Text style={[typography.labelMd, { color: formType === 'expense' ? '#FFFFFF' : colors.onSurfaceVariant }]}>
                  Gasto
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFormType('earning')}
                style={{
                  flex: 1,
                  paddingVertical: spacing.sm,
                  alignItems: 'center',
                  borderRadius: borderRadius.full,
                  backgroundColor: formType === 'earning' ? colors.success : colors.surfaceContainerHigh,
                }}
              >
                <Text style={[typography.labelMd, { color: formType === 'earning' ? '#FFFFFF' : colors.onSurfaceVariant }]}>
                  Ingreso
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={[typography.labelMd, { color: colors.onSurfaceVariant, marginLeft: 4, marginBottom: spacing.sm }]}>Color</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {presetColors.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setFormColor(c)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: c,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: formColor === c ? 3 : 0,
                    borderColor: '#FFFFFF',
                  }}
                >
                  {formColor === c && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
                </TouchableOpacity>
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
