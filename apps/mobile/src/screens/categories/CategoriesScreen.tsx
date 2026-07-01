import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { GlassCard } from '../../components/ui/GlassCard';
import { Input } from '../../components/ui/Input';
import { GradientButton } from '../../components/ui/GradientButton';
import { categoriesApi, expensesApi } from '../../services/api';
import { useSnackbar } from '../../context/SnackbarContext';
import { useNavigation } from '@react-navigation/native';
import type { RootNavigationProp } from '../../navigation/types';
import { formatCurrency } from '../../utils/format';
import type { Category, Expense } from '@finance-flow/shared-types';

const presetColors = ['#7C3AED', '#EC4899', '#06B6D4', '#4ADE80', '#F59E0B', '#8B5CF6', '#F472B6', '#14B8A6', '#3B82F6', '#EF4444', '#10B981', '#F97316'];

export function CategoriesScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showError } = useSnackbar();
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState(presetColors[0]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [catData, expData] = await Promise.all([
        categoriesApi.getAll(),
        expensesApi.getAll(),
      ]);
      setCategories(catData);
      setExpenses(expData);
    } catch {
      showError('Error al cargar categorías');
    }
  };

  const getCategoryExpenses = (catId: number) => {
    return expenses.filter(e => e.categories?.some(c => c.id === catId));
  };

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.value), 0);

  const openCreate = () => {
    setEditCategory(null);
    setFormName('');
    setFormDescription('');
    setFormColor(presetColors[0]);
    setModalVisible(true);
  };

  const openEdit = (cat: Category) => {
    setEditCategory(cat);
    setFormName(cat.name);
    setFormDescription(cat.description || '');
    setFormColor(cat.color);
    setModalVisible(true);
  };

  const handleDelete = (cat: Category) => {
    Alert.alert('Eliminar categoría', `¿Eliminar "${cat.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await categoriesApi.delete(cat.id);
            loadCategories();
          } catch {
            showError('Error al eliminar categoría');
          }
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    try {
      if (editCategory) {
        await categoriesApi.update(editCategory.id, { name: formName, description: formDescription || undefined, color: formColor });
      } else {
        await categoriesApi.create({ name: formName, description: formDescription || undefined, color: formColor });
      }
      setModalVisible(false);
      loadCategories();
    } catch {
      showError('Error al guardar categoría');
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch {
      showError('Error al cargar categorías');
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
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
        ListHeaderComponent={
          <>
            <GlassCard style={{ marginBottom: spacing.md }}>
              <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>Total gastado</Text>
              <Text style={[typography.displayMd, { color: colors.onSurface, marginTop: spacing.xs }]}>
                {formatCurrency(totalSpent)}
              </Text>
              {totalSpent > 0 && (
                <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
                  {categories.slice(0, 4).map((cat) => {
                    const catExpenses = getCategoryExpenses(cat.id);
                    const catTotal = catExpenses.reduce((s, e) => s + Number(e.value), 0);
                    const percent = totalSpent > 0 ? (catTotal / totalSpent) * 100 : 0;
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
        }
        renderItem={({ item }) => {
          const catExpenses = getCategoryExpenses(item.id);
          const catTotal = catExpenses.reduce((s, e) => s + e.value, 0);
          return (
            <TouchableOpacity
              onPress={() => openEdit(item)}
              onLongPress={() => handleDelete(item)}
            >
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
                      {catExpenses.length} transacciones
                    </Text>
                  </View>
                  <Text style={[typography.titleMd, { color: colors.onSurface }]}>
                    {formatCurrency(catTotal)}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceVariant} />
                </View>
              </GlassCard>
            </TouchableOpacity>
          );
        }}
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
