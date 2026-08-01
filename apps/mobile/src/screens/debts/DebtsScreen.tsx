import { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { GlassCard } from '../../components/ui/GlassCard';
import { DebtCard } from '../../components/ui/DebtCard';
import { FocusFadeIn } from '../../components/ui/FocusFadeIn';
import { typography, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../context/SnackbarContext';
import { formatCurrency } from '../../utils/format';
import { getMyDirection, isDebtOutstanding } from '../../utils/debts';
import { goBackOrHome } from '../../utils/navigation';
import { debtsApi } from '../../services/api';
import type { RootNavigationProp } from '../../navigation/types';
import type { Debt, DebtSummary } from '@finance-flow/shared-types';

type Filter = 'all' | 'receivable' | 'payable' | 'paid';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'receivable', label: 'Me deben' },
  { key: 'payable', label: 'Debo' },
  { key: 'paid', label: 'Pagadas' },
];

export function DebtsScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showError } = useSnackbar();
  const myProfileId = user?.profile?.id ?? 0;
  const [debts, setDebts] = useState<Debt[]>([]);
  const [summary, setSummary] = useState<DebtSummary | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  useFocusEffect(
    useCallback(() => { loadData(); }, [])
  );

  const loadData = async () => {
    try {
      const [data, summaryData] = await Promise.all([
        debtsApi.getAll({ limit: 100, sortBy: 'createdAt', sortOrder: 'DESC' }),
        debtsApi.getSummary(),
      ]);
      setDebts(data);
      setSummary(summaryData);
    } catch {
      showError('Error al cargar deudas');
    }
  };

  const handleBack = () => {
    goBackOrHome(navigation);
  };

  const receivableTotal = summary?.receivableTotal ?? 0;
  const payableTotal = summary?.payableTotal ?? 0;

  const filteredDebts = useMemo(() => {
    const pending = (d: Debt) => isDebtOutstanding(d.status);
    return debts.filter((d) => {
      switch (filter) {
        case 'receivable': return pending(d) && getMyDirection(d, myProfileId) === 'receivable';
        case 'payable': return pending(d) && getMyDirection(d, myProfileId) === 'payable';
        case 'paid': return d.status === 'paid';
        default: return true;
      }
    });
  }, [debts, filter, myProfileId]);

  const hasOutstanding = receivableTotal > 0 || payableTotal > 0;

  return (
    <FocusFadeIn>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <LinearGradient
          colors={colors.gradient.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.lg, paddingHorizontal: spacing.container }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <TouchableOpacity
              onPress={handleBack}
              style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
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
              <Ionicons name="receipt" size={20} color="#FFFFFF" />
            </View>
            <Text style={[typography.headlineSm, { color: '#FFFFFF', flex: 1 }]}>
              Mis Deudas
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Contacts')}
              style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="people" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing['2xl'] + 40, paddingHorizontal: spacing.container, gap: spacing.md, paddingTop: spacing.lg }}
        >
          <GlassCard glowColor={colors.primary}>
            <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>
              Resumen de deudas
            </Text>
            <View style={{ flexDirection: 'row', marginTop: spacing.md }}>
              <View style={{ flex: 1, gap: spacing.xs }}>
                <Text style={[typography.labelMd, { color: colors.success }]}>Me deben</Text>
                <Text style={[typography.headlineMd, { color: colors.success }]}>
                  {formatCurrency(receivableTotal)}
                </Text>
              </View>
              <View
                style={{
                  width: 1,
                  backgroundColor: colors.outlineVariant + '60',
                  marginHorizontal: spacing.lg,
                }}
              />
              <View style={{ flex: 1, gap: spacing.xs }}>
                <Text style={[typography.labelMd, { color: colors.error }]}>Debo</Text>
                <Text style={[typography.headlineMd, { color: colors.error }]}>
                  {formatCurrency(payableTotal)}
                </Text>
              </View>
            </View>
          </GlassCard>

          {!hasOutstanding && (
            <GlassCard>
              <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
                No tienes deudas pendientes
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('AddDebt')}
                style={{
                  marginTop: spacing.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing.xs,
                }}
              >
                <Ionicons name="add" size={18} color={colors.primary} />
                <Text style={[typography.labelLg, { color: colors.primary }]}>Crear deuda</Text>
              </TouchableOpacity>
            </GlassCard>
          )}

          <View style={{ gap: spacing.md }}>
            <Text style={[typography.titleLg, { color: colors.onSurface }]}>
              Todas tus deudas
            </Text>
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: colors.surfaceContainerHigh,
                borderRadius: borderRadius.full,
                padding: spacing.xs,
              }}
            >
              {FILTERS.map((f) => (
                <TouchableOpacity
                  key={f.key}
                  onPress={() => setFilter(f.key)}
                  style={{
                    flex: 1,
                    paddingVertical: spacing.sm + 2,
                    borderRadius: borderRadius.full,
                    backgroundColor: filter === f.key ? colors.primary : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={[
                      typography.labelMd,
                      { color: filter === f.key ? '#FFFFFF' : colors.onSurfaceVariant, fontWeight: '600' },
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {filteredDebts.length === 0 ? (
              <GlassCard>
                <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
                  No hay deudas aquí
                </Text>
              </GlassCard>
            ) : (
              filteredDebts.map((debt) => (
                <DebtCard
                  key={debt.id}
                  debt={debt}
                  myProfileId={myProfileId}
                  onPress={() => navigation.navigate('DebtDetail', { debtId: debt.id })}
                />
              ))
            )}
          </View>
        </ScrollView>

        <TouchableOpacity
          onPress={() => navigation.navigate('AddDebt')}
          style={{
            position: 'absolute',
            right: spacing.container,
            bottom: insets.bottom + spacing.md,
            width: 58,
            height: 58,
            borderRadius: 29,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.45,
            shadowRadius: 16,
            elevation: 10,
          }}
        >
          <LinearGradient
            colors={colors.gradient.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 58,
              height: 58,
              borderRadius: 29,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 3,
              borderColor: colors.background,
            }}
          >
            <Ionicons name="add" size={30} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </FocusFadeIn>
  );
}
