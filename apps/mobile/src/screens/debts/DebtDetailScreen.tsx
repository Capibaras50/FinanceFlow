import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect, type RouteProp } from '@react-navigation/native';
import { GlassCard } from '../../components/ui/GlassCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { GradientButton } from '../../components/ui/GradientButton';
import { typography, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../context/SnackbarContext';
import { showAlert } from '../../components/ui/AppAlert';
import { formatCurrency, getErrorMessage } from '../../utils/format';
import { DEBT_TYPE_LABELS, DEBT_PRIORITY_LABELS, getMyDirection, formatInterestRate } from '../../utils/debts';
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
      await debtsApi.pay(debtId, receipt);
      showSuccess('Deuda pagada');
      loadData();
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
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!debt) return null;

  const isReceivable = getMyDirection(debt, myProfileId) === 'receivable';
  const amountColor = isReceivable ? colors.success : colors.error;
  const interest = formatInterestRate(debt.interestRate);
  const isPayable = debt.status === 'pending' || debt.status === 'overdue';

  const InfoRow = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant }]}>{label}</Text>
      <Text style={[typography.titleMd, { color: valueColor ?? colors.onSurface, maxWidth: '60%', textAlign: 'right' }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={colors.gradient.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing['2xl'], paddingHorizontal: spacing.container }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <TouchableOpacity
            onPress={() => goBackOrHome(navigation)}
            style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={[typography.headlineSm, { color: '#FFFFFF', flex: 1 }]}>
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
            style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="pencil" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: 'center', marginTop: spacing.md, gap: spacing.sm }}>
          <Text style={[typography.labelMd, { color: 'rgba(255,255,255,0.75)' }]}>
            {isReceivable ? 'Te deben' : 'Debes'}
          </Text>
          <Text style={[typography.displayMd, { color: '#FFFFFF' }]}>
            {formatCurrency(Number(debt.amount))}
          </Text>
          <StatusBadge status={debt.status} />
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing['2xl'] + 40, paddingTop: spacing.lg }}
      >
        <View style={{ paddingHorizontal: spacing.container, gap: spacing.md }}>
          <GlassCard>
            <View style={{ gap: spacing.md }}>
              <InfoRow label="Persona" value={debt.contactName} />
              <InfoRow label="Tipo" value={DEBT_TYPE_LABELS[debt.debtType]} />
              <InfoRow label="Prioridad" value={DEBT_PRIORITY_LABELS[debt.priority]} />
              {interest && (
                <InfoRow label="Interés mensual" value={interest} />
              )}
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
          </GlassCard>

          {debt.description ? (
            <GlassCard>
              <Text style={[typography.labelMd, { color: colors.onSurfaceVariant, marginBottom: spacing.sm }]}>
                Descripción
              </Text>
              <Text style={[typography.bodyMd, { color: colors.onSurface }]}>
                {debt.description}
              </Text>
            </GlassCard>
          ) : null}

          {debt.receiptUrl ? (
            <TouchableOpacity onPress={() => Linking.openURL(debt.receiptUrl!)}>
              <GlassCard style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="image" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.titleMd, { color: colors.onSurface }]}>Comprobante</Text>
                  <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>Toca para ver el comprobante</Text>
                </View>
                <Ionicons name="open-outline" size={20} color={colors.primary} />
              </GlassCard>
            </TouchableOpacity>
          ) : null}

          {isPayable && (
            <GradientButton
              title={paying ? 'Procesando pago...' : 'Marcar como pagada'}
              onPress={handlePay}
              disabled={paying}
            />
          )}

          <GradientButton
            title="Eliminar deuda"
            variant="ghost"
            onPress={handleDelete}
            style={{ borderWidth: 1, borderColor: colors.error + '40' }}
          />
        </View>
      </ScrollView>
    </View>
  );
}
