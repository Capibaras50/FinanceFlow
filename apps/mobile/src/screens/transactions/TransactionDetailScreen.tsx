import { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography, strokeWidth, spacing, borderRadius, layout, outlineColor } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { GradientButton } from '../../components/ui/GradientButton';
import { SkeletonDetailBody, SkeletonTransactionDetailHeader } from '../../components/ui/Skeleton';
import { formatCurrency } from '../../utils/format';
import { goBackOrHome } from '../../utils/navigation';
import { expensesApi, earningsApi } from '../../services/api';
import { useSnackbar } from '../../context/SnackbarContext';
import { showAlert } from '../../components/ui/AppAlert';
import { useNavigation, useRoute, useFocusEffect, type RouteProp } from '@react-navigation/native';
import type { RootNavigationProp, RootStackParamList } from '../../navigation/types';
import type { Expense, Earning } from '@finance-flow/shared-types';
import type { ThemeColors } from '../../theme';

export function TransactionDetailScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'TransactionDetail'>>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { transactionId, type } = route.params;
  const isExpense = type === 'expense';
  const { showError } = useSnackbar();
  const [transaction, setTransaction] = useState<Expense | Earning | null>(null);
  const [deleteFocused, setDeleteFocused] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadTransaction = useCallback(async () => {
    try {
      const data = isExpense
        ? await expensesApi.getById(transactionId)
        : await earningsApi.getById(transactionId);
      setTransaction(data);
    } catch {
      showError('Error al cargar detalle');
    } finally {
      setLoading(false);
    }
  }, [isExpense, transactionId, showError]);

  useFocusEffect(
    useCallback(() => {
      loadTransaction();
    }, [loadTransaction])
  );

  const handleDelete = () => {
    showAlert({
      title: 'Eliminar transacción',
      message: `¿Estás seguro de eliminar "${transaction?.name}"?`,
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              if (isExpense) {
                await expensesApi.delete(transactionId);
              } else {
                await earningsApi.delete(transactionId);
              }
              goBackOrHome(navigation);
            } catch {
              showError('Error al eliminar transacción');
            }
          },
        },
      ],
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <SkeletonTransactionDetailHeader paddingTop={insets.top + spacing.sm} isExpense={isExpense} />
        <SkeletonDetailBody
          rows={5}
          actions={2}
          framed={false}
          actionsLayout="split"
          label="Cargando transacción…"
        />
      </View>
    );
  }

  if (!transaction) return null;

  const sign = isExpense ? '-' : '+';
  const amountColor = isExpense ? colors.error : colors.success;
  const typeColor = isExpense ? colors.error : colors.success;
  const iconName = isExpense ? 'trending-down' : 'trending-up';
  const navigateToEdit = () => navigation.navigate(
    type === 'expense' ? 'AddExpense' : 'AddEarning',
    { [type === 'expense' ? 'expenseId' : 'earningId']: transactionId }
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          paddingTop: insets.top + spacing.sm,
          paddingBottom: spacing.lg,
          paddingHorizontal: spacing.container,
          backgroundColor: colors.surface,
          borderBottomWidth: strokeWidth.medium,
          borderBottomColor: colors.outlineVariant,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <HeaderIconButton icon="arrow-back" label="Volver" onPress={() => goBackOrHome(navigation)} colors={colors} />
          <View style={{ flex: 1 }}>
            <Text style={[typography.headlineSm, { color: colors.onSurface }]}>
              {isExpense ? 'Detalle del Gasto' : 'Detalle del Ingreso'}
            </Text>
          </View>
          <HeaderIconButton icon="trash-outline" label="Eliminar transacción" onPress={handleDelete} colors={colors} />
          <HeaderIconButton icon="pencil" label="Editar transacción" onPress={navigateToEdit} colors={colors} />
        </View>

        <View style={{ alignItems: 'center', gap: spacing.xs, marginTop: spacing.lg }}>
          <View
            accessible={false}
            style={{
              width: 48,
              height: 48,
              borderRadius: borderRadius.md,
              backgroundColor: isExpense ? colors.errorContainer : colors.successContainer,
              borderWidth: strokeWidth.medium,
              borderColor: typeColor,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.xs,
            }}
          >
            <Ionicons name={iconName} size={24} color={typeColor} />
          </View>
          <Text style={[typography.labelMd, { color: typeColor }]}>
            {isExpense ? 'Gasto' : 'Ingreso'}
          </Text>
          <Text style={[typography.titleMd, { color: colors.onSurfaceVariant }]}>
            {transaction.name}
          </Text>
          <Text
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${isExpense ? 'Gasto' : 'Ingreso'} de ${formatCurrency(transaction.value)}`}
            style={[typography.displayMd, { color: amountColor }]}
          >
            {sign}{formatCurrency(transaction.value)}
          </Text>
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
          paddingBottom: spacing['2xl'],
          gap: spacing.md,
        }}
      >
        <View style={{ borderTopWidth: strokeWidth.medium, borderTopColor: colors.outlineVariant }}>
          <DetailRow label="Nombre" value={transaction.name} colors={colors} />
          {transaction.description && (
            <DetailRow label="Descripción" value={transaction.description} colors={colors} />
          )}
          <DetailRow label="Monto" value={`${sign}${formatCurrency(transaction.value)}`} valueColor={amountColor} colors={colors} />
          <DetailRow label="Cartera" value={transaction.wallet?.name ?? '-'} colors={colors} />
          <DetailRow
            label="Fecha"
            value={new Date(transaction.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            colors={colors}
          />
          {transaction.category && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: layout.touchTarget,
                borderBottomWidth: strokeWidth.medium,
                borderBottomColor: colors.outlineVariant,
              }}
            >
              <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant }]}>Categoría</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <View
                  accessible={false}
                  style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: transaction.category.color }}
                />
                <Text style={[typography.labelMd, { color: colors.onSurface }]}>
                  {transaction.category.name}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <GradientButton
            title="Editar"
            onPress={navigateToEdit}
            style={{ flex: 1 }}
          />
          <Pressable
            onPress={handleDelete}
            onFocus={() => setDeleteFocused(true)}
            onBlur={() => setDeleteFocused(false)}
            accessibilityRole="button"
            accessibilityLabel="Eliminar transacción"
            hitSlop={4}
            style={({ pressed }) => [
              {
                width: layout.touchTarget + 8,
                height: layout.touchTarget + 8,
                borderRadius: borderRadius.md,
                backgroundColor: colors.errorContainer,
                borderWidth: strokeWidth.medium,
                borderColor: colors.outline,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.85 : 1,
              },
              deleteFocused ? outlineColor(colors.error) : undefined,
            ]}
          >
            <Ionicons name="trash-outline" size={22} color={colors.error} accessible={false} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function HeaderIconButton({
  icon,
  label,
  onPress,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  colors: ThemeColors;
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
        focused ? outlineColor(colors.primary) : undefined,
      ]}
    >
      <Ionicons name={icon} size={20} color={colors.onSurface} accessible={false} />
    </Pressable>
  );
}

function DetailRow({
  label,
  value,
  valueColor,
  colors,
}: {
  label: string;
  value: string;
  valueColor?: string;
  colors: ThemeColors;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: layout.touchTarget,
        gap: spacing.md,
        borderBottomWidth: strokeWidth.medium,
        borderBottomColor: colors.outlineVariant,
      }}
    >
      <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant }]}>{label}</Text>
      <Text
        accessibilityRole="text"
        accessibilityLabel={`${label}: ${value}`}
        numberOfLines={1}
        style={[
          typography.titleMd,
          {
            color: valueColor ?? colors.onSurface,
            maxWidth: '60%',
            textAlign: 'right',
            fontVariant: ['tabular-nums'],
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}
