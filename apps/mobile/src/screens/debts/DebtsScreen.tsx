import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
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
import { goBackOrHome } from '../../utils/navigation';
import { debtsApi } from '../../services/api';
import type { RootNavigationProp } from '../../navigation/types';
import type { Debt, DebtSummary, DebtDirection, DebtStatus, DebtPriority } from '@finance-flow/shared-types';
import type { DebtFilterParams } from '@finance-flow/api-client';

interface ActiveFilters {
  direction?: DebtDirection;
  status?: DebtStatus;
  priority?: DebtPriority;
  name?: string;
}

const DIRECTION_FILTERS: { value: DebtDirection | undefined; label: string; icon: 'options-outline' | 'arrow-down-circle' | 'arrow-up-circle' }[] = [
  { value: undefined, label: 'Todas', icon: 'options-outline' },
  { value: 'receivable', label: 'Me deben', icon: 'arrow-down-circle' },
  { value: 'payable', label: 'Debo', icon: 'arrow-up-circle' },
];

const STATUS_FILTERS: { value: DebtStatus | undefined; label: string }[] = [
  { value: undefined, label: 'Todas' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'overdue', label: 'Vencida' },
  { value: 'paid', label: 'Pagada' },
  { value: 'cancelled', label: 'Cancelada' },
];

const PRIORITY_FILTERS: { value: DebtPriority | undefined; label: string }[] = [
  { value: undefined, label: 'Todas' },
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
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
  const [filters, setFilters] = useState<ActiveFilters>({});
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [draftFilters, setDraftFilters] = useState<ActiveFilters>({});

  const hasActiveFilters =
    filters.direction !== undefined ||
    filters.status !== undefined ||
    filters.priority !== undefined ||
    (filters.name?.length ?? 0) > 0;

  const loadData = useCallback(async (effective?: ActiveFilters) => {
    const active = effective ?? filters;
    const params: DebtFilterParams = {
      limit: 100,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      direction: active.direction,
      status: active.status,
      priority: active.priority,
      name: active.name?.trim() || undefined,
    };
    try {
      const [data, summaryData] = await Promise.all([
        debtsApi.getAll(params),
        debtsApi.getSummary(),
      ]);
      setDebts(data);
      setSummary(summaryData);
    } catch {
      showError('Error al cargar deudas');
    }
  }, [filters, showError]);

  useFocusEffect(
    useCallback(() => { loadData(); }, [loadData])
  );

  const openFilters = () => {
    setDraftFilters({ ...filters, name: searchText.trim() || undefined });
    setShowFilters(true);
  };

  const applySearch = () => {
    const next = { ...filters, name: searchText.trim() || undefined };
    setFilters(next);
    loadData(next);
  };

  const clearSearch = () => {
    setSearchText('');
    const next = { ...filters, name: undefined };
    setFilters(next);
    loadData(next);
  };

  const applyFilters = () => {
    setShowFilters(false);
    setFilters(draftFilters);
    loadData(draftFilters);
  };

  const clearFilters = () => {
    setShowFilters(false);
    setSearchText('');
    setFilters({});
    loadData({});
  };

  const handleBack = () => {
    goBackOrHome(navigation);
  };

  const receivableTotal = summary?.receivableTotal ?? 0;
  const payableTotal = summary?.payableTotal ?? 0;
  const hasOutstanding = receivableTotal > 0 || payableTotal > 0;

  const FilterChip = ({ label, selected, onPress, color }: { label: string; selected: boolean; onPress: () => void; color?: string }) => {
    const accent = color ?? colors.primary;
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={{
          paddingVertical: spacing.sm + 2,
          paddingHorizontal: spacing.md,
          borderRadius: borderRadius.full,
          backgroundColor: selected ? accent + '1F' : colors.surfaceContainerHigh,
          borderWidth: 1,
          borderColor: selected ? accent : colors.outlineVariant,
        }}
      >
        <Text style={[typography.labelMd, { color: selected ? accent : colors.onSurfaceVariant, fontWeight: '600' }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

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
          keyboardShouldPersistTaps="handled"
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

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surfaceContainerHigh,
              borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.md,
              borderWidth: 1,
              borderColor: colors.outlineVariant,
            }}
          >
            <Ionicons name="search" size={18} color={colors.onSurfaceVariant} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Buscar por concepto..."
              placeholderTextColor={colors.onSurfaceVariant}
              returnKeyType="search"
              onSubmitEditing={applySearch}
              style={[typography.bodyMd, { flex: 1, color: colors.onSurface, paddingVertical: spacing.sm + 2, marginLeft: spacing.sm }]}
            />
            {searchText.length > 0 ? (
              <TouchableOpacity onPress={clearSearch} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={openFilters} hitSlop={8} style={{ marginLeft: spacing.sm }}>
              <Ionicons
                name="filter"
                size={20}
                color={hasActiveFilters ? colors.primary : colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>

          {hasActiveFilters && (
            <TouchableOpacity
              onPress={clearFilters}
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, alignSelf: 'flex-start' }}
            >
              <Ionicons name="close-circle" size={16} color={colors.primary} />
              <Text style={[typography.bodySm, { color: colors.primary }]}>Filtros activos · Limpiar</Text>
            </TouchableOpacity>
          )}

          {!hasOutstanding && !hasActiveFilters && (
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
              {hasActiveFilters ? 'Resultados' : 'Todas tus deudas'}
            </Text>

            {debts.length === 0 ? (
              <GlassCard>
                <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
                  No hay deudas con estos filtros
                </Text>
              </GlassCard>
            ) : (
              debts.map((debt) => (
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

        <Modal visible={showFilters} transparent animationType="slide" onRequestClose={() => setShowFilters(false)}>
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View
              style={{
                backgroundColor: colors.surface,
                borderTopLeftRadius: borderRadius['2xl'],
                borderTopRightRadius: borderRadius['2xl'],
                padding: spacing.container,
                paddingBottom: insets.bottom + spacing.lg,
                maxHeight: '75%',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }}>
                <Text style={[typography.titleLg, { color: colors.onSurface }]}>Filtros</Text>
                <TouchableOpacity onPress={() => setShowFilters(false)} hitSlop={8}>
                  <Ionicons name="close" size={24} color={colors.onSurface} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={[typography.titleMd, { color: colors.onSurface, marginBottom: spacing.sm }]}>Dirección</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.lg }}>
                  {DIRECTION_FILTERS.map((f) => (
                    <TouchableOpacity
                      key={f.label}
                      onPress={() => setDraftFilters((prev) => ({ ...prev, direction: f.value }))}
                      activeOpacity={0.8}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.xs,
                        paddingVertical: spacing.xs + 2,
                        paddingHorizontal: spacing.md,
                        borderRadius: borderRadius.full,
                        backgroundColor: draftFilters.direction === f.value ? colors.primary : colors.surfaceContainerHigh,
                      }}
                    >
                      <Ionicons name={f.icon} size={16} color={draftFilters.direction === f.value ? '#FFFFFF' : colors.onSurfaceVariant} />
                      <Text style={[typography.labelMd, { color: draftFilters.direction === f.value ? '#FFFFFF' : colors.onSurfaceVariant }]}>
                        {f.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[typography.titleMd, { color: colors.onSurface, marginBottom: spacing.sm }]}>Estado</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.lg }}>
                  {STATUS_FILTERS.map((f) => (
                    <FilterChip
                      key={f.label}
                      label={f.label}
                      selected={draftFilters.status === f.value}
                      onPress={() => setDraftFilters((prev) => ({ ...prev, status: f.value }))}
                    />
                  ))}
                </View>

                <Text style={[typography.titleMd, { color: colors.onSurface, marginBottom: spacing.sm }]}>Prioridad</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.lg }}>
                  {PRIORITY_FILTERS.map((f) => (
                    <FilterChip
                      key={f.label}
                      label={f.label}
                      selected={draftFilters.priority === f.value}
                      onPress={() => setDraftFilters((prev) => ({ ...prev, priority: f.value }))}
                      color={f.value === 'high' ? colors.error : f.value === 'low' ? colors.success : f.value === 'medium' ? colors.warning : undefined}
                    />
                  ))}
                </View>

                <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                  <TouchableOpacity
                    onPress={clearFilters}
                    style={{
                      flex: 1,
                      paddingVertical: spacing.md,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: borderRadius.full,
                      borderWidth: 1.5,
                      borderColor: colors.outlineVariant,
                    }}
                  >
                    <Text style={[typography.labelMd, { color: colors.onSurfaceVariant, fontWeight: '600' }]}>
                      Limpiar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={applyFilters}
                    style={{
                      flex: 1,
                      paddingVertical: spacing.md,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: borderRadius.full,
                      backgroundColor: colors.primary,
                    }}
                  >
                    <Text style={[typography.labelMd, { color: '#FFFFFF', fontWeight: '600' }]}>
                      Aplicar
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </FocusFadeIn>
  );
}
