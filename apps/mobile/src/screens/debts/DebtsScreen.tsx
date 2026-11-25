import { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { GlassCard } from '../../components/ui/GlassCard';
import { DebtCard } from '../../components/ui/DebtCard';
import { FocusFadeIn } from '../../components/ui/FocusFadeIn';
import { StatePanel } from '../../components/ui/StatePanel';
import { SkeletonDebtRows, SkeletonLine } from '../../components/ui/Skeleton';
import { Glyph } from '../../components/ui/Glyph';
import { typography, strokeWidth, spacing, borderRadius, layout } from '../../theme';
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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

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
    setLoading(true);
    setLoadError(false);
    try {
      const [data, summaryData] = await Promise.all([
        debtsApi.getAll(params),
        debtsApi.getSummary(),
      ]);
      setDebts(data);
      setSummary(summaryData);
    } catch {
      setLoadError(true);
      showError('Error al cargar deudas');
    } finally {
      setLoading(false);
    }
  }, [filters, showError]);

  // Ref pattern: the focus effect only refetches when the screen gains focus.
  // Filter/search actions call loadData explicitly with their overrides.
  const loadDataRef = useRef(loadData);
  useEffect(() => {
    loadDataRef.current = loadData;
  }, [loadData]);

  useFocusEffect(
    useCallback(() => { loadDataRef.current(); }, [])
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

  const FilterChip = ({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      hitSlop={4}
      style={{
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        backgroundColor: selected ? colors.primaryContainer : colors.surfaceContainerHigh,
        borderWidth: strokeWidth.medium,
        borderColor: selected ? colors.primary : colors.outlineVariant,
      }}
    >
      <Text style={[typography.labelMd, {
        color: selected ? colors.primary : colors.onSurfaceVariant,
        fontWeight: selected ? '600' : '400',
      }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const filterSection = (title: string, children: React.ReactNode) => (
    <View
      style={{
        paddingBottom: spacing.md,
        marginBottom: spacing.md,
        borderBottomWidth: strokeWidth.medium,
        borderBottomColor: colors.outlineVariant,
      }}
    >
      <Text style={[typography.titleMd, { color: colors.onSurface, marginBottom: spacing.sm }]}>{title}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>{children}</View>
    </View>
  );

  return (
    <FocusFadeIn>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          style={{
            backgroundColor: colors.surface,
            borderBottomWidth: strokeWidth.medium,
            borderBottomColor: colors.outlineVariant,
            paddingTop: insets.top + spacing.md,
            paddingBottom: spacing.md,
            paddingHorizontal: spacing.container,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, width: '100%', maxWidth: layout.contentMaxWidth, alignSelf: 'center' }}>
            <TouchableOpacity
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Volver"
              hitSlop={4}
              style={iconButton}
            >
              <Ionicons name="arrow-back" size={20} color={colors.onSurface} />
            </TouchableOpacity>
            <Glyph name="receipt" tone="primary" size={44} />
            <Text accessibilityRole="header" style={[typography.headlineSm, { color: colors.onSurface, flex: 1 }]}>
              Mis Deudas
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Contacts')}
              accessibilityRole="button"
              accessibilityLabel="Ir a contactos"
              hitSlop={4}
              style={iconButton}
            >
              <Ionicons name="people" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            width: '100%',
            maxWidth: layout.contentMaxWidth,
            alignSelf: 'center',
            paddingBottom: spacing['2xl'] + 40,
            paddingHorizontal: spacing.container,
            gap: spacing.md,
            paddingTop: spacing.lg,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <GlassCard>
            <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>
              Resumen de deudas
            </Text>
            <View style={{ flexDirection: 'row', marginTop: spacing.md }}>
              <View style={{ flex: 1, gap: spacing.xs }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <Ionicons accessible={false} name="arrow-down-circle" size={14} color={colors.success} />
                  <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>Me deben</Text>
                </View>
                {loading ? (
                  <SkeletonLine width="86%" height={30} radius={borderRadius.md} />
                ) : (
                  <Text style={[typography.displayMd, { color: colors.success }]}>
                    +{formatCurrency(receivableTotal)}
                  </Text>
                )}
              </View>
              <View
                style={{
                  width: strokeWidth.medium,
                  backgroundColor: colors.outlineVariant,
                  marginHorizontal: spacing.lg,
                }}
              />
              <View style={{ flex: 1, gap: spacing.xs }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <Ionicons accessible={false} name="arrow-up-circle" size={14} color={colors.error} />
                  <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>Debo</Text>
                </View>
                {loading ? (
                  <SkeletonLine width="86%" height={30} radius={borderRadius.md} />
                ) : (
                  <Text style={[typography.displayMd, { color: colors.error }]}>
                    −{formatCurrency(payableTotal)}
                  </Text>
                )}
              </View>
            </View>
          </GlassCard>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surfaceContainerHigh,
              borderRadius: borderRadius.md,
              paddingHorizontal: spacing.md,
              borderWidth: strokeWidth.medium,
              borderColor: colors.outlineVariant,
            }}
          >
            <Ionicons accessible={false} name="search" size={18} color={colors.onSurfaceVariant} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Buscar por concepto..."
              placeholderTextColor={colors.onSurfaceVariant}
              returnKeyType="search"
              onSubmitEditing={applySearch}
              accessibilityLabel="Buscar por concepto"
              style={[typography.bodyMd, { flex: 1, color: colors.onSurface, paddingVertical: spacing.sm + 2, marginLeft: spacing.sm }]}
            />
            {searchText.length > 0 ? (
              <TouchableOpacity
                onPress={clearSearch}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Limpiar búsqueda"
              >
                <Ionicons accessible={false} name="close-circle" size={18} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={openFilters}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={hasActiveFilters ? 'Filtros (activos)' : 'Abrir filtros'}
              style={{ marginLeft: spacing.sm }}
            >
              <Ionicons
                accessible={false}
                name="filter"
                size={20}
                color={hasActiveFilters ? colors.primary : colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>

          {hasActiveFilters && (
            <TouchableOpacity
              onPress={clearFilters}
              accessibilityRole="button"
              accessibilityLabel="Limpiar filtros"
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, alignSelf: 'flex-start', minHeight: layout.touchTarget }}
            >
              <Ionicons accessible={false} name="close-circle" size={16} color={colors.primary} />
              <Text style={[typography.bodySm, { color: colors.primary }]}>Filtros activos · Limpiar</Text>
            </TouchableOpacity>
          )}

          <View style={{ gap: spacing.md }}>
            <Text accessibilityRole="header" style={[typography.titleLg, { color: colors.onSurface }]}>
              {hasActiveFilters ? 'Resultados' : 'Todas tus deudas'}
            </Text>

            {loading && debts.length === 0 ? (
              <SkeletonDebtRows rows={4} label="Cargando deudas…" />
            ) : loadError && debts.length === 0 ? (
              <StatePanel
                state="error"
                title="No pudimos cargar tus deudas"
                onAction={() => loadData()}
              />
            ) : debts.length === 0 ? (
              <StatePanel
                state="empty"
                title={hasActiveFilters ? 'No hay deudas con estos filtros' : 'No tienes deudas pendientes'}
                message={hasActiveFilters
                  ? 'Prueba con otros filtros o limpia la búsqueda.'
                  : 'Registra tu primera deuda para empezar.'}
              />
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

            {!hasActiveFilters && debts.length === 0 && !loading && !loadError && (
              <TouchableOpacity
                onPress={() => navigation.navigate('AddDebt')}
                accessibilityRole="button"
                accessibilityLabel="Crear deuda"
                style={{
                  alignSelf: 'center',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                  minHeight: layout.touchTarget,
                  paddingHorizontal: spacing.lg,
                  borderRadius: borderRadius.md,
                  backgroundColor: colors.primaryContainer,
                  borderWidth: strokeWidth.medium,
                  borderColor: colors.outline,
                }}
              >
                <Ionicons accessible={false} name="add" size={18} color={colors.primary} />
                <Text style={[typography.labelLg, { color: colors.primary }]}>Crear deuda</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        <TouchableOpacity
          onPress={() => navigation.navigate('AddDebt')}
          accessibilityRole="button"
          accessibilityLabel="Crear deuda"
          hitSlop={4}
          style={{
            position: 'absolute',
            right: spacing.container,
            bottom: insets.bottom + spacing.md,
            width: 56,
            height: 56,
            borderRadius: borderRadius.full,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primaryContainer,
            borderWidth: strokeWidth.medium,
            borderColor: colors.outline,
          }}
        >
          <Ionicons accessible={false} name="add" size={26} color={colors.primary} />
        </TouchableOpacity>

        <Modal visible={showFilters} transparent animationType="slide" onRequestClose={() => setShowFilters(false)}>
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View
              accessible={false}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: colors.surfaceContainerLowest,
                opacity: 0.75,
              }}
            />
            <View
              style={{
                backgroundColor: colors.surface,
                borderTopLeftRadius: borderRadius['2xl'],
                borderTopRightRadius: borderRadius['2xl'],
                borderTopWidth: strokeWidth.medium,
                borderTopColor: colors.outlineVariant,
                padding: spacing.container,
                paddingBottom: insets.bottom + spacing.lg,
                maxHeight: '75%',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }}>
                <Text accessibilityRole="header" style={[typography.titleLg, { color: colors.onSurface }]}>Filtros</Text>
                <TouchableOpacity
                  onPress={() => setShowFilters(false)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar filtros"
                  style={{ minHeight: layout.touchTarget, minWidth: layout.touchTarget, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Ionicons accessible={false} name="close" size={22} color={colors.onSurface} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {filterSection(
                  'Dirección',
                  DIRECTION_FILTERS.map((f) => {
                    const selected = draftFilters.direction === f.value;
                    return (
                      <TouchableOpacity
                        key={f.label}
                        onPress={() => setDraftFilters((prev) => ({ ...prev, direction: f.value }))}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        accessibilityLabel={f.label}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: spacing.xs,
                          minHeight: layout.touchTarget - 6,
                          paddingHorizontal: spacing.md,
                          borderRadius: borderRadius.full,
                          backgroundColor: selected ? colors.primaryContainer : colors.surfaceContainerHigh,
                          borderWidth: strokeWidth.medium,
                          borderColor: selected ? colors.primary : colors.outlineVariant,
                        }}
                      >
                        <Ionicons accessible={false} name={f.icon} size={15} color={selected ? colors.primary : colors.onSurfaceVariant} />
                        <Text style={[typography.labelMd, { color: selected ? colors.primary : colors.onSurfaceVariant }]}>
                          {f.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                )}

                {filterSection(
                  'Estado',
                  STATUS_FILTERS.map((f) => (
                    <FilterChip
                      key={f.label}
                      label={f.label}
                      selected={draftFilters.status === f.value}
                      onPress={() => setDraftFilters((prev) => ({ ...prev, status: f.value }))}
                    />
                  ))
                )}

                {filterSection(
                  'Prioridad',
                  PRIORITY_FILTERS.map((f) => (
                    <FilterChip
                      key={f.label}
                      label={f.label}
                      selected={draftFilters.priority === f.value}
                      onPress={() => setDraftFilters((prev) => ({ ...prev, priority: f.value }))}
                    />
                  ))
                )}

                <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
                  <TouchableOpacity
                    onPress={clearFilters}
                    accessibilityRole="button"
                    accessibilityLabel="Limpiar filtros"
                    style={{
                      flex: 1,
                      minHeight: layout.touchTarget,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: borderRadius.md,
                      borderWidth: strokeWidth.medium,
                      borderColor: colors.outlineVariant,
                    }}
                  >
                    <Text style={[typography.labelMd, { color: colors.onSurfaceVariant, fontWeight: '600' }]}>
                      Limpiar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={applyFilters}
                    accessibilityRole="button"
                    accessibilityLabel="Aplicar filtros"
                    style={{
                      flex: 1,
                      minHeight: layout.touchTarget,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.primaryContainer,
                      borderWidth: strokeWidth.medium,
                      borderColor: colors.outline,
                    }}
                  >
                    <Text style={[typography.labelMd, { color: colors.primary, fontWeight: '600' }]}>
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
