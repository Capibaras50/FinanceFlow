import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { GlassCard } from '../../components/ui/GlassCard';
import { GradientButton } from '../../components/ui/GradientButton';
import { formatCurrency } from '../../utils/format';
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

  const loadTransaction = useCallback(async () => {
    try {
      const data = isExpense
        ? await expensesApi.getById(transactionId)
        : await earningsApi.getById(transactionId);
      setTransaction(data);
    } catch {
      showError('Error al cargar detalle');
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
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            } catch {
              showError('Error al eliminar transacción');
            }
          },
        },
      ],
    });
  };

  if (!transaction) return null;

  const gradientColors = isExpense ? colors.gradient.primary : colors.gradient.accent;
  const sign = isExpense ? '-' : '+';
  const amountColor = isExpense ? colors.error : colors.success;
  const iconName = isExpense ? 'trending-down' : 'trending-up';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.xl, paddingHorizontal: spacing.container }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg }}>
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
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={[typography.headlineSm, { color: '#FFFFFF', flex: 1 }]}>
            {isExpense ? 'Detalle del Gasto' : 'Detalle del Ingreso'}
          </Text>
          <TouchableOpacity
            onPress={handleDelete}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate(type === 'expense' ? 'AddExpense' : 'AddEarning', { [type === 'expense' ? 'expenseId' : 'earningId']: transactionId })}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="pencil" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: 'center', gap: spacing.xs }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              backgroundColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.xs,
            }}
          >
            <Ionicons name={iconName} size={24} color="#FFFFFF" />
          </View>
          <Text style={[typography.titleMd, { color: 'rgba(255,255,255,0.8)' }]}>
            {transaction.name}
          </Text>
          <Text style={[typography.displayMd, { color: '#FFFFFF', marginTop: spacing.xs }]}>
            {sign}{formatCurrency(transaction.value)}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: spacing.container }}
        contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: spacing['2xl'], gap: spacing.md }}
      >
        <GlassCard>
          <View style={{ gap: spacing.md }}>
            <DetailRow label="Nombre" value={transaction.name} colors={colors} />
            {transaction.description && (
              <DetailRow label="Descripción" value={transaction.description} colors={colors} />
            )}
            <DetailRow label="Monto" value={`${sign}${formatCurrency(transaction.value)}`} valueColor={amountColor} colors={colors} />
            <DetailRow label="Cartera" value={transaction.wallet?.name ?? '-'} colors={colors} />
            <DetailRow label="Fecha" value={new Date(transaction.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} colors={colors} />
            {transaction.category && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant }]}>Categoría</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.xs,
                    backgroundColor: transaction.category.color + '20',
                    paddingVertical: spacing.xs + 1,
                    paddingHorizontal: spacing.sm,
                    borderRadius: borderRadius.full,
                  }}
                >
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: transaction.category.color }} />
                  <Text style={[typography.labelMd, { color: transaction.category.color }]}>{transaction.category.name}</Text>
                </View>
              </View>
            )}
          </View>
        </GlassCard>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <GradientButton
            title="Editar"
            gradient={gradientColors}
            onPress={() => navigation.navigate(type === 'expense' ? 'AddExpense' : 'AddEarning', { [type === 'expense' ? 'expenseId' : 'earningId']: transactionId })}
            style={{ flex: 1 }}
          />
          <TouchableOpacity
            onPress={handleDelete}
            style={{
              width: 52,
              height: 52,
              borderRadius: borderRadius.full,
              backgroundColor: colors.error + '20',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1.5,
              borderColor: colors.error + '40',
            }}
          >
            <Ionicons name="trash-outline" size={22} color={colors.error} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant }]}>{label}</Text>
      <Text
        style={[
          typography.titleMd,
          { color: valueColor ?? colors.onSurface, maxWidth: '60%', textAlign: 'right' },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}
