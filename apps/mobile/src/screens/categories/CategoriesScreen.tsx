import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { GlassCard } from '../../components/ui/GlassCard';
import { Input } from '../../components/ui/Input';
import { GradientButton } from '../../components/ui/GradientButton';
import { categoriesApi, expensesApi, earningsApi } from '../../services/api';
import { useSnackbar } from '../../context/SnackbarContext';
import { showAlert } from '../../components/ui/AppAlert';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { RootNavigationProp } from '../../navigation/types';
import { formatCurrency } from '../../utils/format';
import type { Category, Expense, Earning } from '@finance-flow/shared-types';

const presetColors = ['#7C3AED', '#EC4899', '#06B6D4', '#4ADE80', '#F59E0B', '#8B5CF6', '#F472B6', '#14B8A6', '#3B82F6', '#EF4444', '#10B981', '#F97316'];

export function CategoriesScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showError } = useSnackbar();
  const PAGE_SIZE = 100;
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState(presetColors[0]);
  const [formType, setFormType] = useState<'expense' | 'earning'>('expense');

  useFocusEffect(
    useCallback(() => { loadFirstPage(); }, [])
  );

  const loadFirstPage = async () => {
    try {
      const [catData, expData, earnData] = await Promise.all([
        categoriesApi.getAll({ limit: PAGE_SIZE, page: 1 }),
        expensesApi.getAll({ limit: 100 }),
        earningsApi.getAll({ limit: 100 }),
      ]);
      setCategories(catData);
      setExpenses(expData);
      setEarnings(earnData);
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
      setCategories(prev => [...prev, ...newData]);
      setPage(nextPage);
      if (newData.length < PAGE_SIZE) setHasMore(false);
    } catch {
      showError('Error al cargar más categorías');
    } finally {
      setLoadingMore(false);
    }
  };

  const getCategoryTransactions = (catId: number) => {
    const catExpenses = expenses.filter(e => e.category?.id === catId);
    const catEarnings = earnings.filter(e => e.category?.id === catId);
    return { catExpenses, catEarnings };
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.value), 0);

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
    const { catExpenses, catEarnings } = getCategoryTransactions(cat.id);
    const totalTx = catExpenses.length + catEarnings.length;
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={colors.gradient.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.lg, paddingHorizontal: spacing.container }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <TouchableOpacity onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('MainTabs', { screen: 'Home' });
            }
          }}>
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
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: spacing.container, gap: spacing.md }}
        ListHeaderComponent={() => (
          <>
            <GlassCard style={{ marginBottom: spacing.md }}>
              <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>Total gastado</Text>
              <Text style={[typography.displayMd, { color: colors.onSurface, marginTop: spacing.xs }]}>
                {formatCurrency(totalExpenses)}
              </Text>
              {totalExpenses > 0 && (
                <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
                  {categories.map((cat) => {
                    const { catExpenses } = getCategoryTransactions(cat.id);
                    const catTotal = catExpenses.reduce((s, e) => s + Number(e.value), 0);
                    const percent = totalExpenses > 0 ? (catTotal / totalExpenses) * 100 : 0;
                    if (catTotal <= 0) return null;
                    return (
                      <View key={cat.id}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                          <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>{cat.name}</Text>
                          <Text style={[typography.bodySm, { color: colors.onSurface }]}>{formatCurrency(catTotal)}</Text>
                        </View>
                        <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.surfaceContainerHighest, overflow: 'hidden' }}>
                          <View style={{ height: '100%', width: `${Math.min(percent, 100)}%`, borderRadius: 3, backgroundColor: cat.color }} />
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
          const { catExpenses, catEarnings } = getCategoryTransactions(item.id);
          const catExpenseTotal = catExpenses.reduce((s, e) => s + Number(e.value), 0);
          const catEarningTotal = catEarnings.reduce((s, e) => s + Number(e.value), 0);
          const catBalance = catEarningTotal - catExpenseTotal;
          const totalTx = catExpenses.length + catEarnings.length;
          const isNegative = catBalance < 0;
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
                    {isNegative ? '-' : ''}{formatCurrency(Math.abs(catBalance))}
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
                No hay categorías aún
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
