import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { Input } from '../../components/ui/Input';
import { GradientButton } from '../../components/ui/GradientButton';
import { CategoryChip } from '../../components/ui/CategoryChip';
import { categoriesApi, walletsApi, expensesApi } from '../../services/api';
import { useSnackbar } from '../../context/SnackbarContext';
import type { Category, Wallet } from '@finance-flow/shared-types';

export function AddExpenseScreen({ navigation, route }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const expenseId = route?.params?.expenseId;
  const isEditing = !!expenseId;

  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<number | null>(null);
  const { showError } = useSnackbar();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [catData, walData] = await Promise.all([
        categoriesApi.getAll(),
        walletsApi.getAll(),
      ]);
      setCategories(catData);
      setWallets(walData);

      if (expenseId) {
        const expense = await expensesApi.getById(expenseId);
        setName(expense.name);
        setValue(String(expense.value));
        setDescription(expense.description ?? '');
        if (expense.wallet) setSelectedWallet(expense.wallet.id);
        if (expense.categories.length > 0) setSelectedCategory(expense.categories[0].id);
      } else if (walData.length > 0) {
        setSelectedWallet(walData[0].id);
      }
    } catch {
      showError('Error al cargar datos');
    }
  };

  const handleSave = async () => {
    if (!name || !value || !selectedCategory || !selectedWallet) return;
    setLoading(true);
    try {
      const dto = {
        name,
        value: parseFloat(value),
        description: description || undefined,
        walletId: selectedWallet,
        categoriesId: [selectedCategory],
      };
      if (isEditing) {
        await expensesApi.update(expenseId, dto);
      } else {
        await expensesApi.create(dto);
      }
      navigation.goBack();
    } catch (e: any) {
      showError(e?.message || 'Error al guardar gasto');
    } finally {
      setLoading(false);
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
        <Input
          label="Nombre del gasto"
          placeholder="Ej: Supermercado"
          value={name}
          onChangeText={setName}
        />
        <Input
          label="Valor"
          placeholder="0.00"
          value={value}
          onChangeText={setValue}
          keyboardType="decimal-pad"
          prefix="$"
        />
        <Input
          label="Descripción"
          placeholder="Opcional"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={2}
        />

        <View style={{ gap: spacing.sm }}>
          <Text style={[typography.labelMd, { color: colors.onSurfaceVariant, marginLeft: 4 }]}>
            Categoría
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
            {categories.map((cat) => (
              <CategoryChip
                key={cat.id}
                category={cat}
                selected={selectedCategory === cat.id}
                onPress={() => setSelectedCategory(cat.id)}
              />
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

        <GradientButton
          title="Escanear Recibo"
          onPress={() => navigation.navigate('ReceiptScanner')}
          variant="outlined"
          style={{ marginTop: spacing.md }}
        />

        <GradientButton
          title={isEditing ? 'Actualizar Gasto' : 'Guardar Gasto'}
          onPress={handleSave}
          disabled={loading || !name || !value || !selectedCategory}
        />
      </ScrollView>
    </View>
  );
}
