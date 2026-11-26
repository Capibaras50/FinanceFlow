import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography, strokeWidth, spacing, borderRadius, layout, outlineColor } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { Input } from '../../components/ui/Input';
import { GradientButton } from '../../components/ui/GradientButton';
import { DateTimePickerModal } from '../../components/ui/DateTimePickerModal';
import { showAlert } from '../../components/ui/AppAlert';
import { categoriesApi, walletsApi, earningsApi } from '../../services/api';
import { useSnackbar } from '../../context/SnackbarContext';
import { getErrorMessage, formatCurrencyInput, parsePositiveAmount } from '../../utils/format';
import { goBackOrHome } from '../../utils/navigation';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { RootNavigationProp, RootStackParamList } from '../../navigation/types';
import type { Category, Wallet } from '@finance-flow/shared-types';
import type { ThemeColors } from '../../theme';

export function AddEarningScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'AddEarning'>>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const amountType = width < 380 ? typography.headlineMd : typography.displayMd;
  const earningId = route.params?.earningId;
  const isEditing = !!earningId;

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
      setCategories(catData.filter(c => c.type === 'earning'));
      setWallets(walData);

      if (earningId) {
        const earning = await earningsApi.getById(earningId);
        setName(earning.name);
        setValue(formatCurrencyInput(String(earning.value)));
        setDescription(earning.description ?? '');
        if (earning.wallet) setSelectedWallet(earning.wallet.id);
        if (earning.category) setSelectedCategory(earning.category.id);
        if (earning.createdAt) setCreatedAt(new Date(earning.createdAt));
      } else if (walData.length > 0) {
        setSelectedWallet(walData[0].id);
      }
    } catch {
      showError('Error al cargar datos');
    }
  };

  const handleSave = async () => {
    if (!name || !value || !selectedCategory || !selectedWallet) return;
    const numValue = parsePositiveAmount(value);
    if (numValue === null) return;
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
        await earningsApi.update(earningId, dto);
      } else {
        await earningsApi.create(dto);
      }
      goBackOrHome(navigation);
    } catch (e) {
      showError(getErrorMessage(e, 'Error al guardar ingreso'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    showAlert({
      title: 'Eliminar ingreso',
      message: `¿Estás seguro de eliminar "${name}"?`,
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (!earningId) return;
            try {
              await earningsApi.delete(earningId);
              goBackOrHome(navigation);
            } catch (e) {
              showError(getErrorMessage(e, 'Error al eliminar ingreso'));
            }
          },
        },
      ],
    });
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

  const isValueValid = parsePositiveAmount(value) !== null;
  const canSave = name && isValueValid && selectedCategory && selectedWallet;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={{
          paddingTop: insets.top + spacing.sm,
          paddingBottom: spacing.md,
          paddingHorizontal: spacing.container,
          backgroundColor: colors.surface,
          borderBottomWidth: strokeWidth.medium,
          borderBottomColor: colors.outlineVariant,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <HeaderIconButton icon="close" label="Cerrar" onPress={() => goBackOrHome(navigation)} colors={colors} />
          <View
            accessible={false}
            style={{
              width: layout.touchTarget,
              height: layout.touchTarget,
              borderRadius: borderRadius.md,
              backgroundColor: colors.primaryContainer,
              borderWidth: strokeWidth.medium,
              borderColor: colors.outline,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="trending-up" size={20} color={colors.success} />
          </View>
          <Text style={[typography.headlineSm, { color: colors.onSurface, flex: 1 }]}>
            {isEditing ? 'Editar Ingreso' : 'Nuevo Ingreso'}
          </Text>
          {isEditing && (
            <HeaderIconButton icon="trash-outline" label="Eliminar ingreso" onPress={handleDelete} colors={colors} danger />
          )}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          width: '100%',
          maxWidth: layout.readingMaxWidth,
          alignSelf: 'center',
          paddingHorizontal: spacing.container,
          paddingTop: spacing.lg,
          paddingBottom: spacing['2xl'] + insets.bottom,
          gap: spacing.md,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="Valor del ingreso"
          prefix="$"
          value={value}
          onChangeText={(text) => setValue(formatCurrencyInput(text))}
          placeholder="0.00"
          keyboardType="decimal-pad"
          style={[amountType, { textAlign: 'center' }]}
        />

        <Input
          label="¿Qué ingreso recibiste?"
          placeholder="Ej: Salario"
          value={name}
          onChangeText={setName}
        />

        <View style={{ gap: spacing.sm }}>
          <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>
            Categoría
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
            {categories.map((cat) => (
              <PickerChip
                key={cat.id}
                label={cat.name}
                selected={selectedCategory === cat.id}
                onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                dotColor={cat.color}
                colors={colors}
              />
            ))}
          </ScrollView>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>
            Cartera
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
            {wallets.map((w) => (
              <PickerChip
                key={w.id}
                label={w.name}
                selected={selectedWallet === w.id}
                onPress={() => setSelectedWallet(w.id)}
                colors={colors}
              />
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          accessibilityRole="button"
          accessibilityLabel={`Fecha: ${formatDateLabel()}`}
          accessibilityHint="Toca para cambiar la fecha y la hora"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: layout.touchTarget,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: borderRadius.md,
            backgroundColor: colors.surfaceContainerHigh,
            borderWidth: strokeWidth.medium,
            borderColor: colors.outlineVariant,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} accessible={false} />
            <Text style={[typography.bodyMd, { color: colors.onSurface }]}>
              {formatDateLabel()}
            </Text>
          </View>
          <Ionicons name="time-outline" size={20} color={colors.primary} accessible={false} />
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
          title={isEditing ? 'Actualizar Ingreso' : 'Guardar Ingreso'}
          onPress={handleSave}
          disabled={loading || !canSave}
          loading={loading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function HeaderIconButton({
  icon,
  label,
  onPress,
  colors,
  danger = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  colors: ThemeColors;
  danger?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      style={({ pressed }) => [
        {
          width: layout.touchTarget,
          height: layout.touchTarget,
          borderRadius: borderRadius.md,
          backgroundColor: colors.surfaceContainerHigh,
          borderWidth: strokeWidth.medium,
          borderColor: colors.outlineVariant,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.85 : 1,
        },
        focused ? outlineColor(danger ? colors.error : colors.primary) : undefined,
      ]}
    >
      <Ionicons name={icon} size={20} color={danger ? colors.error : colors.onSurface} accessible={false} />
    </Pressable>
  );
}

function PickerChip({
  label,
  selected,
  onPress,
  dotColor,
  colors,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  dotColor?: string;
  colors: ThemeColors;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      hitSlop={4}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        minHeight: layout.touchTarget,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        backgroundColor: selected ? colors.primaryContainer : colors.surfaceContainerHigh,
        borderWidth: strokeWidth.medium,
        borderColor: selected ? colors.primary : colors.outlineVariant,
      }}
    >
      {dotColor && (
        <View
          accessible={false}
          style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: dotColor }}
        />
      )}
      <Text style={[typography.labelMd, { color: selected ? colors.primary : colors.onSurfaceVariant }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
