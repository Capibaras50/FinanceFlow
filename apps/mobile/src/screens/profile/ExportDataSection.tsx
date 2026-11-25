import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DateTimePickerModal } from '../../components/ui/DateTimePickerModal';
import { typography, strokeWidth, spacing, borderRadius, layout } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../context/SnackbarContext';
import { getErrorMessage } from '../../utils/format';
import { exportsApi } from '../../services/api';

type ReportType = 'short' | 'large';
type PickerTarget = 'start' | 'end';
type Preset = '3m' | '12m' | 'all';

// El DTO del backend exige startDate >= 2025-01-01.
const MIN_START = new Date(2025, 0, 1);

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function atUtcDay(date: Date, endOfDay = false) {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      endOfDay ? 23 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 999 : 0,
    ),
  ).toISOString();
}

function formatDate(date: Date) {
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function ExportDataSection() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [startDate, setStartDate] = useState<Date>(MIN_START);
  const [endDate, setEndDate] = useState<Date>(startOfToday);
  const [preset, setPreset] = useState<Preset | null>('all');
  const [picker, setPicker] = useState<PickerTarget | null>(null);
  const [loading, setLoading] = useState<ReportType | null>(null);

  const applyPreset = (value: Preset) => {
    const today = startOfToday();
    setPreset(value);
    setEndDate(today);
    if (value === 'all') {
      setStartDate(new Date(MIN_START));
      return;
    }
    const months = value === '3m' ? 3 : 12;
    const candidate = new Date(
      today.getFullYear(),
      today.getMonth() - months,
      today.getDate(),
    );
    setStartDate(candidate < MIN_START ? new Date(MIN_START) : candidate);
  };

  const handleConfirmDate = (date: Date) => {
    const picked = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (picker === 'start') {
      if (picked > endDate) {
        showError('La fecha de inicio no puede ser posterior a la de fin.');
        setPicker(null);
        return;
      }
      setStartDate(picked < MIN_START ? new Date(MIN_START) : picked);
    } else if (picked < startDate) {
      showError('La fecha de fin no puede ser anterior a la de inicio.');
      setPicker(null);
      return;
    } else {
      setEndDate(picked);
    }
    setPreset(null);
    setPicker(null);
  };

  const handleExport = async (type: ReportType) => {
    if (loading) return;
    setLoading(type);
    try {
      const dto = {
        startDate: atUtcDay(startDate),
        endDate: atUtcDay(endDate, true),
      };
      const label = type === 'short' ? 'corto' : 'completo';
      if (type === 'short') {
        await exportsApi.createShortReport(dto);
      } else {
        await exportsApi.createLargeReport(dto);
      }
      showSuccess(
        `Reporte ${label} solicitado. Te lo enviaremos a ${user?.email ?? 'tu correo'}.`,
      );
    } catch (error) {
      showError(getErrorMessage(error, 'Error al solicitar el reporte'));
    } finally {
      setLoading(null);
    }
  };

  const chipStyle = (active: boolean, disabled = false) => ({
    backgroundColor: disabled
      ? colors.surfaceContainerLowest
      : active
        ? colors.primaryContainer
        : colors.surfaceContainerHigh,
    borderColor: active && !disabled ? colors.primary : colors.outlineVariant,
  });

  const chipTextColor = (active: boolean, disabled = false) =>
    disabled ? colors.onSurfaceVariant : active ? colors.onPrimaryContainer : colors.onSurface;

  const reportRow = (
    type: ReportType,
    icon: 'document-text-outline' | 'grid-outline',
    title: string,
    description: string,
    first: boolean,
  ) => (
    <TouchableOpacity
      onPress={() => handleExport(type)}
      disabled={!!loading}
      accessibilityRole="button"
      accessibilityLabel={`Generar ${title}`}
      accessibilityHint={description}
      accessibilityState={{ disabled: !!loading, busy: loading === type }}
      activeOpacity={0.7}
      hitSlop={4}
      style={{ opacity: loading && loading !== type ? 0.55 : 1 }}
    >
      <View style={[s.reportRow, first ? undefined : { borderTopWidth: strokeWidth.medium, borderTopColor: colors.outlineVariant }]}>
        <View style={[s.rowIcon, { backgroundColor: colors.secondaryContainer }]}>
          <Ionicons name={icon} size={20} color={colors.secondary} accessible={false} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[typography.titleMd, { color: colors.onSurface }]}>
            {title}
          </Text>
          <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>
            {description}
          </Text>
        </View>
        <View style={s.trailing}>
          {loading === type ? (
            <ActivityIndicator size="small" color={colors.primary} accessibilityLabel="Generando reporte" />
          ) : (
            <Ionicons name="download-outline" size={20} color={colors.primary} accessible={false} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={s.section}>
      <Text accessibilityRole="header" style={[typography.labelMd, { color: colors.onSurfaceVariant, marginBottom: spacing.xs, paddingLeft: spacing.xs }]}>
        Tus datos
      </Text>
      <Text
        style={[typography.bodySm, { color: colors.onSurfaceVariant, marginBottom: spacing.sm, paddingLeft: spacing.xs }]}
      >
        Exporta un reporte con tu información
      </Text>

      <View style={[s.group, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, marginBottom: spacing.sm }]}>
        <View style={s.periodRow}>
          <View style={[s.rowIcon, { backgroundColor: colors.surfaceContainerHighest }]}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} accessible={false} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.titleMd, { color: colors.onSurface }]}>
              Periodo
            </Text>
            <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>
              {formatDate(startDate)} – {formatDate(endDate)}
            </Text>
          </View>
        </View>

        <View style={s.chipRow}>
          <TouchableOpacity
            onPress={() => setPicker('start')}
            accessibilityRole="button"
            accessibilityLabel={`Cambiar fecha de inicio: ${formatDate(startDate)}`}
            accessibilityHint="Abre el selector de fecha"
            hitSlop={4}
            style={[s.chip, chipStyle(false)]}
          >
            <Text style={[typography.labelMd, { color: chipTextColor(false) }]}>
              Desde: {formatDate(startDate)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setPicker('end')}
            accessibilityRole="button"
            accessibilityLabel={`Cambiar fecha de fin: ${formatDate(endDate)}`}
            accessibilityHint="Abre el selector de fecha"
            hitSlop={4}
            style={[s.chip, chipStyle(false)]}
          >
            <Text style={[typography.labelMd, { color: chipTextColor(false) }]}>
              Hasta: {formatDate(endDate)}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={s.chipRow}>
          {(
            [
              ['3m', '3 meses'],
              ['12m', '12 meses'],
              ['all', 'Todo'],
            ] as const
          ).map(([value, label]) => {
            const active = preset === value;
            return (
              <TouchableOpacity
                key={value}
                onPress={() => applyPreset(value)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Periodo ${label}`}
                hitSlop={4}
                style={[s.chip, chipStyle(active)]}
              >
                <Text style={[typography.labelMd, { color: chipTextColor(active) }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={[s.group, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        {reportRow(
          'short',
          'document-text-outline',
          'Reporte corto',
          'Gastos e ingresos por fecha',
          true,
        )}
        {reportRow(
          'large',
          'grid-outline',
          'Reporte completo',
          'Totales por categoría y bolsillo',
          false,
        )}
      </View>

      <Text
        style={[
          typography.bodySm,
          {
            color: colors.onSurfaceVariant,
            marginTop: spacing.sm,
            paddingLeft: spacing.xs,
          },
        ]}
      >
        Te enviaremos el archivo .xlsx por correo. El enlace de descarga dura 24 horas.
      </Text>

      <DateTimePickerModal
        key={`${picker}-${picker === 'start' ? startDate.getTime() : endDate.getTime()}`}
        visible={picker !== null}
        value={picker === 'start' ? startDate : endDate}
        mode="date"
        defaultUseNow={false}
        onClose={() => setPicker(null)}
        onConfirm={handleConfirmDate}
      />
    </View>
  );
}

const s = StyleSheet.create({
  section: {
    marginTop: spacing.xs,
  },
  group: {
    borderRadius: borderRadius.lg,
    borderWidth: strokeWidth.medium,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 56,
    paddingVertical: spacing.xs,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 64,
    paddingVertical: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  chip: {
    minHeight: layout.touchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    borderWidth: strokeWidth.medium,
  },
  trailing: {
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
