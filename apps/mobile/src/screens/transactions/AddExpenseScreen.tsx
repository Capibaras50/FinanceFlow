import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { Input } from '../../components/ui/Input';
import { GradientButton } from '../../components/ui/GradientButton';
import { DateTimePickerModal } from '../../components/ui/DateTimePickerModal';
import { categoriesApi, walletsApi, expensesApi } from '../../services/api';
import { useSnackbar } from '../../context/SnackbarContext';
import { getErrorMessage } from '../../utils/format';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { RootNavigationProp, RootStackParamList } from '../../navigation/types';
import type { Category, Wallet } from '@finance-flow/shared-types';

export function AddExpenseScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'AddExpense'>>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const expenseId = route.params?.expenseId;
  const isEditing = !!expenseId;

  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<number | null>(null);
  const [createdAt, setCreatedAt] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { showError } = useSnackbar();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [catData, walData] = await Promise.all([
        categoriesApi.getAll({ limit: 100 }),
        walletsApi.getAll({ limit: 100 }),
      ]);
      setCategories(catData.filter(c => c.type === 'expense'));
      setWallets(walData);

      if (expenseId) {
        const expense = await expensesApi.getById(expenseId);
        setName(expense.name);
        setValue(String(expense.value));
        setDescription(expense.description ?? '');
        if (expense.wallet) setSelectedWallet(expense.wallet.id);
        if (expense.category) setSelectedCategory(expense.category.id);
        if (expense.createdAt) setCreatedAt(new Date(expense.createdAt));
      } else if (walData.length > 0) {
        setSelectedWallet(walData[0].id);
      }
    } catch {
      showError('Error al cargar datos');
    }
  };

  const handleSave = async () => {
    if (!name || !value || !selectedCategory || !selectedWallet) return;
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) return;
    setLoading(true);
    try {
      const dto = {
        name,
        value: numValue,
        description: description || undefined,
        walletId: selectedWallet,
        categoryId: selectedCategory,
        createdAt: createdAt.toISOString(),
      };
      if (isEditing) {
        await expensesApi.update(expenseId, dto);
      } else {
        await expensesApi.create(dto);
      }
      navigation.goBack();
    } catch (e) {
      showError(getErrorMessage(e, 'Error al guardar gasto'));
    } finally {
      setLoading(false);
    }
  };

  const formatDateLabel = () => {
    const now = new Date();
    const isToday = createdAt.toDateString() === now.toDateString();
    const timeStr = createdAt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    if (isToday) {
      return `Hoy, ${timeStr}`;
    }
    return createdAt.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) + `, ${timeStr}`;
  };

  const gradientColors = colors.gradient.primary;
  const numValue = parseFloat(value);
  const isValueValid = !isNaN(numValue) && numValue > 0;
  const canSave = name && isValueValid && selectedCategory && selectedWallet;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.lg, paddingHorizontal: spacing.container }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="trending-down" size={20} color="#FFFFFF" />
          </View>
          <Text style={[typography.headlineSm, { color: '#FFFFFF', flex: 1 }]}>
            {isEditing ? 'Editar Gasto' : 'Nuevo Gasto'}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: spacing.container }}
        contentContainerStyle={{ paddingBottom: spacing['2xl'], gap: spacing.md, paddingTop: spacing.lg }}
      >
        <View style={{ alignItems: 'center', paddingVertical: spacing.md }}>
          <Text style={[typography.labelMd, { color: colors.onSurfaceVariant, marginBottom: spacing.sm }]}>
            Valor del gasto
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={[typography.displayMd, { color: colors.primary, marginRight: spacing.xs }]}>$</Text>
            <Input
              value={value}
              onChangeText={setValue}
              placeholder="0.00"
              keyboardType="decimal-pad"
              style={{ textAlign: 'center', minWidth: 160 }}
            />
          </View>
        </View>

        <Input
          label="¿Qué compraste?"
          placeholder="Ej: Supermercado"
          value={name}
          onChangeText={setName}
        />

        <View style={{ gap: spacing.sm }}>
          <Text style={[typography.labelMd, { color: colors.onSurfaceVariant, marginLeft: 4 }]}>
            Categoría
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.md,
                  borderRadius: borderRadius.full,
                  backgroundColor: selectedCategory === cat.id ? colors.primaryContainer + '33' : colors.surfaceContainerHigh,
                  borderWidth: 1,
                  borderColor: selectedCategory === cat.id ? colors.primary : 'transparent',
                }}
              >
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: cat.color }} />
                <Text style={[typography.labelMd, { color: selectedCategory === cat.id ? colors.primary : colors.onSurfaceVariant }]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text style={[typography.labelMd, { color: colors.onSurfaceVariant, marginLeft: 4 }]}>
            Cartera
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
            {wallets.map((w) => (
              <TouchableOpacity
                key={w.id}
                onPress={() => setSelectedWallet(w.id)}
                style={{
                  paddingVertical: spacing.sm + 2,
                  paddingHorizontal: spacing.md,
                  borderRadius: borderRadius.full,
                  backgroundColor: selectedWallet === w.id ? colors.primary : colors.surfaceContainerHigh,
                }}
              >
                <Text
                  style={[
                    typography.labelMd,
                    { color: selectedWallet === w.id ? '#FFFFFF' : colors.onSurfaceVariant },
                  ]}
                >
                  {w.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            borderRadius: borderRadius.lg,
            backgroundColor: colors.surfaceContainerHigh,
            borderWidth: 1,
            borderColor: colors.outlineVariant,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }} />
            <Text style={[typography.bodyMd, { color: colors.onSurface }]}>
              {formatDateLabel()}
            </Text>
          </View>
          <Ionicons name="time-outline" size={20} color={colors.primary} />
        </TouchableOpacity>

        <DateTimePickerModal
          visible={showDatePicker}
          value={createdAt}
          onClose={() => setShowDatePicker(false)}
          onConfirm={(date) => {
            setCreatedAt(date);
            setShowDatePicker(false);
          }}
        />

        <Input
          label="Descripción (opcional)"
          placeholder="Añade detalles adicionales..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <GradientButton
          title={isEditing ? 'Actualizar Gasto' : 'Guardar Gasto'}
          onPress={handleSave}
          disabled={loading || !canSave}
        />
      </ScrollView>
    </View>
  );
}
