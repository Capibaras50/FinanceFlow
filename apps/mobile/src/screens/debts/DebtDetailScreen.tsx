import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect, type RouteProp } from '@react-navigation/native';
import { SkeletonDebtDetailHeader, SkeletonDetailBody } from '../../components/ui/Skeleton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { GradientButton } from '../../components/ui/GradientButton';
import { typography, strokeWidth, spacing, borderRadius, layout } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../context/SnackbarContext';
import { showAlert } from '../../components/ui/AppAlert';
import { formatCurrency, getErrorMessage } from '../../utils/format';
import { DEBT_TYPE_LABELS, DEBT_PRIORITY_LABELS, getMyDirection } from '../../utils/debts';
import { goBackOrHome } from '../../utils/navigation';
import { debtsApi } from '../../services/api';
import * as ImagePicker from 'expo-image-picker';
import type { RootNavigationProp, RootStackParamList } from '../../navigation/types';
import type { Debt } from '@finance-flow/shared-types';

export function DebtDetailScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'DebtDetail'>>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showError, showSuccess } = useSnackbar();
  const { debtId } = route.params;
  const myProfileId = user?.profile?.id ?? 0;

  const [debt, setDebt] = useState<Debt | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await debtsApi.getById(debtId);
      setDebt(data);
    } catch {
      showError('Error al cargar la deuda');
    } finally {
      setLoading(false);
    }
  }, [debtId, showError]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const doPay = async (receipt?: { uri: string; name: string; type: string }) => {
    setPaying(true);
    try {
      const updated = await debtsApi.pay(debtId, receipt);
      setDebt(updated);
      showSuccess('Deuda pagada');
    } catch (e) {
      showError(getErrorMessage(e, 'Error al pagar la deuda'));
    } finally {
      setPaying(false);
    }
  };

  const handlePay = () => {
    showAlert({
      title: 'Pagar deuda',
      message: '¿Cómo quieres registrar el pago?',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Con comprobante', onPress: () => handlePayWithReceipt() },
        { text: 'Sin comprobante', onPress: () => doPay() },
      ],
    });
  };

  const handlePayWithReceipt = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.7,
      });
      if (result.canceled || result.assets.length === 0) return;
      const asset = result.assets[0];
      await doPay({
        uri: asset.uri,
        name: asset.fileName ?? `comprobante-${debtId}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      });
    } catch {
      showError('No se pudo seleccionar el comprobante');
    }
  };

  const handleDelete = () => {
    showAlert({
      title: 'Eliminar deuda',
      message: '¿Seguro que quieres eliminar esta deuda? Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await debtsApi.remove(debtId);
              goBackOrHome(navigation);
            } catch {
              showError('Error al eliminar la deuda');
            }
          },
        },
      ],
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <SkeletonDebtDetailHeader paddingTop={insets.top + spacing.md} />
        <SkeletonDetailBody rows={4} actions={2} framed label="Cargando deuda…" />
      </View>
    );
  }

  if (!debt) return null;

  const isReceivable = getMyDirection(debt, myProfileId) === 'receivable';
  const amountColor = isReceivable ? colors.success : colors.error;
  const isPayable = debt.status === 'pending' || debt.status === 'overdue';

  const iconButton = {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: strokeWidth.medium,
    borderColor: colors.outlineVariant,
  };

  const InfoRow = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 44,
        paddingVertical: spacing.sm,
        borderBottomWidth: strokeWidth.medium,
        borderBottomColor: colors.outlineVariant,
      }}
    >
      <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant }]}>{label}</Text>
      <Text style={[typography.titleMd, { color: valueColor ?? colors.onSurface, maxWidth: '60%', textAlign: 'right' }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomWidth: strokeWidth.medium,
          borderBottomColor: colors.outlineVariant,
          paddingTop: insets.top + spacing.md,
          paddingBottom: spacing.lg,
          paddingHorizontal: spacing.container,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, width: '100%', maxWidth: layout.readingMaxWidth, alignSelf: 'center' }}>
          <TouchableOpacity
            onPress={() => goBackOrHome(navigation)}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={4}
            style={iconButton}
          >
            <Ionicons accessible={false} name="arrow-back" size={20} color={colors.onSurface} />
          </TouchableOpacity>
          <Text accessibilityRole="header" numberOfLines={1} style={[typography.headlineSm, { color: colors.onSurface, flex: 1 }]}>
            {debt.name}
          </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('AddDebt', {
                debtId,
                contactId: debt.contact?.id,
                contactName: debt.contactName,
              })
            }
            accessibilityRole="button"
            accessibilityLabel="Editar deuda"
            hitSlop={4}
            style={iconButton}
          >
            <Ionicons accessible={false} name="pencil" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={{ width: '100%', maxWidth: layout.readingMaxWidth, alignSelf: 'center', marginTop: spacing.lg, gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <Ionicons accessible={false} name={isReceivable ? 'arrow-down-circle' : 'arrow-up-circle'} size={16} color={amountColor} />
            <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>
              {isReceivable ? 'Te deben' : 'Debes'}
            </Text>
          </View>
          <Text
            accessibilityLabel={`${isReceivable ? 'Te deben' : 'Debes'} ${formatCurrency(Number(debt.amount))}`}
            style={[typography.displayMd, { color: amountColor }]}
          >
            {isReceivable ? '+' : '−'}{formatCurrency(Number(debt.amount))}
          </Text>
          <View style={{ marginTop: spacing.xs, alignSelf: 'flex-start' }}>
            <StatusBadge status={debt.status} />
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          width: '100%',
          maxWidth: layout.readingMaxWidth,
          alignSelf: 'center',
          paddingHorizontal: spacing.container,
          paddingBottom: spacing['2xl'] + 40,
          paddingTop: spacing.lg,
          gap: spacing.lg,
        }}
      >
        <View
          style={{
            backgroundColor: colors.surfaceContainerHigh,
            borderRadius: borderRadius.lg,
            borderWidth: strokeWidth.medium,
            borderColor: colors.outlineVariant,
            paddingHorizontal: spacing.md,
          }}
        >
          <Text accessibilityRole="header" style={[typography.titleMd, { color: colors.onSurface, paddingTop: spacing.md }]}>
            Detalles
          </Text>
          <View style={{ marginTop: spacing.sm }}>
            <InfoRow label="Persona" value={debt.contactName} />
            <InfoRow label="Tipo" value={DEBT_TYPE_LABELS[debt.debtType]} />
            <InfoRow label="Prioridad" value={DEBT_PRIORITY_LABELS[debt.priority]} />
            {debt.dueDate && (
              <InfoRow
                label="Vence"
                value={new Date(debt.dueDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
              />
            )}
            {debt.paidAt && (
              <InfoRow
                label="Pagada el"
                value={new Date(debt.paidAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                valueColor={colors.success}
              />
            )}
          </View>
        </View>

        {debt.description ? (
          <View style={{ gap: spacing.sm }}>
            <Text accessibilityRole="header" style={[typography.titleMd, { color: colors.onSurface }]}>
              Descripción
            </Text>
            <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant }]}>
              {debt.description}
            </Text>
          </View>
        ) : null}

        {debt.receiptUrl ? (
          <TouchableOpacity
            onPress={() => Linking.openURL(debt.receiptUrl!)}
            accessibilityRole="button"
            accessibilityLabel="Ver comprobante"
            accessibilityHint="Abre el comprobante de la deuda"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.md,
              minHeight: 64,
              padding: spacing.md,
              backgroundColor: colors.surfaceContainerHigh,
              borderRadius: borderRadius.lg,
              borderWidth: strokeWidth.medium,
              borderColor: colors.outlineVariant,
            }}
          >
            <View
              accessible={false}
              style={{
                width: 40,
                height: 40,
                borderRadius: borderRadius.md,
                backgroundColor: colors.primaryContainer,
                borderWidth: strokeWidth.medium,
                borderColor: colors.outline,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="image" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.titleMd, { color: colors.onSurface }]}>Comprobante</Text>
              <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>Toca para ver el comprobante</Text>
            </View>
            <Ionicons accessible={false} name="open-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        ) : null}

        {isPayable && (
          <GradientButton
            title="Marcar como pagada"
            onPress={handlePay}
            disabled={paying}
            loading={paying}
          />
        )}

        <GradientButton
          title="Eliminar deuda"
          variant="ghost"
          onPress={handleDelete}
          style={{ borderWidth: strokeWidth.medium, borderColor: colors.error }}
        />
      </ScrollView>
    </View>
  );
}
