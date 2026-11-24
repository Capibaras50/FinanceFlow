import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../../components/ui/GlassCard';
import { DateTimePickerModal } from '../../components/ui/DateTimePickerModal';
import { typography, spacing, borderRadius } from '../../theme';
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

  const chipStyle = (active: boolean) => ({
    backgroundColor: active
      ? colors.primaryContainer
      : colors.surfaceContainerHighest,
    borderColor: active ? colors.primary : colors.outlineVariant + '60',
  });

  const reportRow = (
    type: ReportType,
    icon: 'document-text-outline' | 'grid-outline',
    title: string,
    description: string,
  ) => (
    <TouchableOpacity
      onPress={() => handleExport(type)}
      disabled={!!loading}
      accessibilityRole="button"
      accessibilityLabel={`Generar ${title}`}
      accessibilityState={{ disabled: !!loading }}
      activeOpacity={0.7}
    >
      <GlassCard style={{ opacity: loading && loading !== type ? 0.55 : 1 }}>
        <View style={s.menuRow}>
          <View style={[s.menuIcon, { backgroundColor: `${colors.secondary}15` }]}>
            <Ionicons name={icon} size={20} color={colors.secondary} />
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
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="download-outline" size={20} color={colors.primary} />
            )}
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <View style={{ marginTop: spacing.md }}>
      <Text
        style={[
          typography.labelMd,
          {
            color: colors.onSurfaceVariant,
            marginBottom: spacing.xs,
            marginLeft: spacing.xs,
          },
        ]}
      >
        TUS DATOS
      </Text>
      <Text
        style={[
          typography.bodySm,
          {
            color: colors.onSurfaceVariant,
            marginBottom: spacing.sm,
            marginLeft: spacing.xs,
          },
        ]}
      >
        Exporta un reporte con tu información
      </Text>

      <GlassCard style={s.card}>
        <View style={s.menuRow}>
          <View style={[s.menuIcon, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
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
            style={[s.chip, chipStyle(false)]}
          >
            <Text style={[typography.labelMd, { color: colors.onSurface }]}>
              Desde: {formatDate(startDate)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setPicker('end')}
            accessibilityRole="button"
            accessibilityLabel={`Cambiar fecha de fin: ${formatDate(endDate)}`}
            style={[s.chip, chipStyle(false)]}
          >
            <Text style={[typography.labelMd, { color: colors.onSurface }]}>
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
                style={[s.chip, chipStyle(active)]}
              >
                <Text
                  style={[
                    typography.labelMd,
                    { color: active ? colors.onPrimaryContainer : colors.onSurfaceVariant },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </GlassCard>

      {reportRow(
        'short',
        'document-text-outline',
        'Reporte corto',
        'Gastos e ingresos por fecha',
      )}
      {reportRow(
        'large',
        'grid-outline',
        'Reporte completo',
        'Totales por categoría y bolsillo',
      )}

      <Text
        style={[
          typography.bodySm,
          {
            color: colors.onSurfaceVariant,
            marginTop: spacing.xs,
            marginLeft: spacing.xs,
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
  card: {
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  trailing: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
