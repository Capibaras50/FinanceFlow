import { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  FlatList,
  type ListRenderItemInfo,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import type { ThemeColors } from '../../theme/colors';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { typography, strokeWidth, spacing, borderRadius, layout } from '../../theme';
import { GradientButton } from './GradientButton';

interface DateTimePickerModalProps {
  visible: boolean;
  value: Date;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  mode?: 'date' | 'datetime';
  /** Por defecto arranca en "Hoy". Para rangos históricos, pasar `false`. */
  defaultUseNow?: boolean;
}

const DAY_LABELS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const HOUR_ITEMS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTE_ITEMS = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const ITEM_HEIGHT = 40;
const VISIBLE_COUNT = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;

interface ScrollPickerProps {
  items: string[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  colors: ThemeColors;
}

function ScrollPicker({ items, selectedIndex, onIndexChange, colors }: ScrollPickerProps) {
  const flatListRef = useRef<FlatList<string>>(null);

  const safeIndex = Math.max(0, Math.min(selectedIndex, items.length - 1));

  const snapToNearest = useCallback(
    (offsetY: number) => {
      const index = Math.round(offsetY / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(index, items.length - 1));
      onIndexChange(clamped);
    },
    [items.length, onIndexChange],
  );

  const handleMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      snapToNearest(e.nativeEvent.contentOffset.y);
    },
    [snapToNearest],
  );

  const handleScrollEndDrag = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      snapToNearest(e.nativeEvent.contentOffset.y);
    },
    [snapToNearest],
  );

  const handleItemPress = useCallback(
    (index: number) => {
      flatListRef.current?.scrollToOffset({
        offset: index * ITEM_HEIGHT,
        animated: true,
      });
      onIndexChange(index);
    },
    [onIndexChange],
  );

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<string>) => {
      const isSelected = index === safeIndex;
      return (
        <TouchableOpacity
          onPress={() => handleItemPress(index)}
          activeOpacity={0.6}
          style={{
            height: ITEM_HEIGHT,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: isSelected ? 20 : 15,
              fontWeight: isSelected ? '700' : '400',
              color: isSelected ? colors.primary : colors.outline,
            }}
          >
            {item}
          </Text>
        </TouchableOpacity>
      );
    },
    [safeIndex, colors, handleItemPress],
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<string> | null | undefined, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  return (
    <View style={{ height: PICKER_HEIGHT, overflow: 'hidden' }}>
      <View
        style={{
          position: 'absolute',
          top: ITEM_HEIGHT * 2,
          left: 0,
          right: 0,
          height: ITEM_HEIGHT,
          backgroundColor: colors.surfaceContainerHigh,
          borderRadius: borderRadius.lg,
          borderWidth: strokeWidth.medium,
          borderColor: colors.outlineVariant,
          zIndex: 0,
        }}
      />
      <FlatList
        ref={flatListRef}
        data={items}
        renderItem={renderItem}
        keyExtractor={(_, i) => String(i)}
        getItemLayout={getItemLayout}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollEndDrag={handleScrollEndDrag}
        initialScrollIndex={safeIndex}
        onScrollToIndexFailed={({ index }) => {
          flatListRef.current?.scrollToOffset({ offset: index * ITEM_HEIGHT, animated: false });
        }}
        style={{ zIndex: 1 }}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
      />
    </View>
  );
}

export function DateTimePickerModal({ visible, value, onClose, onConfirm, mode = 'datetime', defaultUseNow = true }: DateTimePickerModalProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const isDateMode = mode === 'date';

  const [useNow, setUseNow] = useState(defaultUseNow);
  const [viewDate, setViewDate] = useState(new Date(value));
  const [selectedDay, setSelectedDay] = useState(value.getDate());
  const [hour, setHour] = useState(value.getHours() % 12 || 12);
  const [minute, setMinute] = useState(value.getMinutes());
  const [ampm, setAmpm] = useState<'AM' | 'PM'>(value.getHours() >= 12 ? 'PM' : 'AM');

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const calendarDays = useMemo(() => {
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let i = 1; i <= daysInMonth; i++) cells.push(i);
    return cells;
  }, [firstDay, daysInMonth]);

  const handlePrevMonth = () => {
    const d = new Date(year, month - 1, 1);
    setViewDate(d);
    setSelectedDay(Math.min(selectedDay, getDaysInMonth(d.getFullYear(), d.getMonth())));
  };

  const handleNextMonth = () => {
    const d = new Date(year, month + 1, 1);
    setViewDate(d);
    setSelectedDay(Math.min(selectedDay, getDaysInMonth(d.getFullYear(), d.getMonth())));
  };

  const buildDate = () => {
    if (isDateMode) {
      return new Date(year, month, selectedDay);
    }
    const h24 = ampm === 'PM' ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour);
    return new Date(year, month, selectedDay, h24, minute);
  };

  const handleConfirm = () => {
    if (useNow) {
      onConfirm(new Date());
    } else {
      onConfirm(buildDate());
    }
  };

  const formatTimeLabel = () => {
    if (isDateMode) {
      const d = buildDate();
      return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    if (useNow) return 'Hoy, ahora mismo';
    const d = buildDate();
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const timeStr = `${hour}:${String(minute).padStart(2, '0')} ${ampm}`;
    if (isToday) return `Hoy, ${timeStr}`;
    const dateStr = d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${dateStr}, ${timeStr}`;
  };

  const isDisabled = useNow;
  const disabledStyle = { opacity: 0.35 } as const;

  const CELL_SIZE = 36;

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduceMotion ? 'none' : 'slide'}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: colors.scrim, justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: colors.surfaceContainer,
            borderTopLeftRadius: borderRadius['2xl'],
            borderTopRightRadius: borderRadius['2xl'],
            paddingTop: spacing.md,
            paddingHorizontal: spacing.container,
            paddingBottom: insets.bottom + spacing.lg,
          }}
        >
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.outlineVariant, alignSelf: 'center', marginBottom: spacing.md }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <Text style={[typography.titleLg, { color: colors.onSurface }]}>
              {isDateMode ? 'Seleccionar Fecha' : 'Seleccionar Fecha y Hora'}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cerrar selector de fecha"
              hitSlop={8}
              style={{ minHeight: layout.touchTarget, minWidth: layout.touchTarget, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons accessible={false} name="close" size={22} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setUseNow(!useNow)}
            accessibilityRole="button"
            accessibilityLabel={isDateMode ? 'Usar la fecha actual' : 'Usar hoy, ahora mismo'}
            accessibilityState={{ selected: useNow }}
            hitSlop={4}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: 56,
              padding: spacing.md,
              borderRadius: borderRadius.md,
              backgroundColor: useNow ? colors.primaryContainer : colors.surfaceContainerHigh,
              borderWidth: strokeWidth.medium,
              borderColor: useNow ? colors.primary : colors.outlineVariant,
              marginBottom: spacing.md,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: useNow ? colors.primary : colors.onSurfaceVariant }} />
              <View>
                <Text style={[typography.bodyMd, { color: colors.onSurface, fontWeight: '600' }]}>
                  {isDateMode ? 'Hoy' : 'Hoy, ahora mismo'}
                </Text>
                <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>
                  {isDateMode ? 'Usar la fecha actual' : 'Opción recomendada'}
                </Text>
              </View>
            </View>
            <View
              style={{
                width: 48,
                height: 28,
                borderRadius: 14,
                backgroundColor: useNow ? colors.primary : colors.surfaceContainerHighest,
                justifyContent: 'center',
                paddingHorizontal: 3,
              }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: colors.onPrimary,
                  alignSelf: useNow ? 'flex-end' : 'flex-start',
                }}
              />
            </View>
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={{ gap: spacing.md }}>
            <View style={isDisabled ? disabledStyle : undefined} pointerEvents={isDisabled ? 'none' : 'auto'}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
                <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>
                  {MONTHS_ES[month]} {year}
                </Text>
                <View style={{ flexDirection: 'row', gap: 2 }}>
                  <TouchableOpacity
                    onPress={handlePrevMonth}
                    accessibilityRole="button"
                    accessibilityLabel="Mes anterior"
                    hitSlop={8}
                    style={{ minHeight: layout.touchTarget, minWidth: layout.touchTarget, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Ionicons accessible={false} name="chevron-back" size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleNextMonth}
                    accessibilityRole="button"
                    accessibilityLabel="Mes siguiente"
                    hitSlop={8}
                    style={{ minHeight: layout.touchTarget, minWidth: layout.touchTarget, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Ionicons accessible={false} name="chevron-forward" size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ flexDirection: 'row', marginBottom: spacing.xs }}>
                {DAY_LABELS.map((label, idx) => (
                  <View key={`daylabel-${idx}`} style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={[typography.labelMd, { color: colors.onSurfaceVariant, fontSize: 11 }]}>{label}</Text>
                  </View>
                ))}
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {calendarDays.map((day, i) => (
                  <View key={`cal-${i}`} style={{ width: `${100 / 7}%`, alignItems: 'center', justifyContent: 'center', height: CELL_SIZE }}>
                    {day !== null ? (
                      <TouchableOpacity
                        onPress={() => setSelectedDay(day)}
                        accessibilityRole="button"
                        accessibilityLabel={`Día ${day}`}
                        accessibilityState={{ selected: selectedDay === day }}
                        hitSlop={2}
                        style={{
                          width: CELL_SIZE,
                          height: CELL_SIZE,
                          borderRadius: borderRadius.full,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: selectedDay === day ? colors.primary : 'transparent',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: selectedDay === day ? '700' : '400',
                            color: selectedDay === day ? colors.onPrimary : colors.onSurface,
                          }}
                        >
                          {day}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={{ width: CELL_SIZE, height: CELL_SIZE }} />
                    )}
                  </View>
                ))}
              </View>
            </View>

            {!isDateMode && (
              <View style={isDisabled ? disabledStyle : undefined} pointerEvents={isDisabled ? 'none' : 'auto'}>
                <Text style={[typography.labelMd, { color: colors.onSurfaceVariant, marginBottom: spacing.sm }]}>Hora</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs }}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <ScrollPicker
                    items={HOUR_ITEMS}
                    selectedIndex={hour - 1}
                    onIndexChange={(i) => setHour(i + 1)}
                    colors={colors}
                  />
                  <Text style={[typography.labelMd, { color: colors.onSurfaceVariant, fontSize: 10, marginTop: spacing.xs }]}>Hora</Text>
                </View>

                <Text style={[typography.titleLg, { color: colors.onSurfaceVariant }]}>:</Text>

                <View style={{ alignItems: 'center', flex: 1 }}>
                  <ScrollPicker
                    items={MINUTE_ITEMS}
                    selectedIndex={Math.min(MINUTE_ITEMS.length - 1, Math.round(minute / 5))}
                    onIndexChange={(i) => setMinute(i * 5)}
                    colors={colors}
                  />
                  <Text style={[typography.labelMd, { color: colors.onSurfaceVariant, fontSize: 10, marginTop: spacing.xs }]}>Min</Text>
                </View>

                <View style={{ gap: 6, marginLeft: spacing.sm }}>
                  <TouchableOpacity
                    onPress={() => setAmpm('AM')}
                    accessibilityRole="button"
                    accessibilityLabel="AM"
                    accessibilityState={{ selected: ampm === 'AM' }}
                    hitSlop={4}
                    style={{
                      minHeight: layout.touchTarget,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      borderRadius: borderRadius.md,
                      backgroundColor: ampm === 'AM' ? colors.primaryContainer : colors.surfaceContainerHigh,
                      borderWidth: strokeWidth.medium,
                      borderColor: ampm === 'AM' ? colors.primary : colors.outlineVariant,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: ampm === 'AM' ? colors.primary : colors.onSurfaceVariant }}>AM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setAmpm('PM')}
                    accessibilityRole="button"
                    accessibilityLabel="PM"
                    accessibilityState={{ selected: ampm === 'PM' }}
                    hitSlop={4}
                    style={{
                      minHeight: layout.touchTarget,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      borderRadius: borderRadius.md,
                      backgroundColor: ampm === 'PM' ? colors.primaryContainer : colors.surfaceContainerHigh,
                      borderWidth: strokeWidth.medium,
                      borderColor: ampm === 'PM' ? colors.primary : colors.outlineVariant,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: ampm === 'PM' ? colors.primary : colors.onSurfaceVariant }}>PM</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            )}

            <GradientButton title="Confirmar" onPress={handleConfirm} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
