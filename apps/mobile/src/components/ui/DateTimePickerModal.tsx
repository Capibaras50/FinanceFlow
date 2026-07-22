import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, FlatList, type ListRenderItemInfo } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { typography, spacing, borderRadius } from '../../theme';

interface DateTimePickerModalProps {
  visible: boolean;
  value: Date;
  onClose: () => void;
  onConfirm: (date: Date) => void;
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
  colors: any;
}

function ScrollPicker({ items, selectedIndex, onIndexChange, colors }: ScrollPickerProps) {
  const flatListRef = useRef<FlatList>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialScroll = useRef(true);

  const snapToNearest = useCallback(
    (offsetY: number) => {
      const index = Math.round(offsetY / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(index, items.length - 1));
      onIndexChange(clamped);
      flatListRef.current?.scrollToOffset({
        offset: clamped * ITEM_HEIGHT,
        animated: true,
      });
    },
    [items.length, onIndexChange],
  );

  const handleScroll = useCallback(
    (e: any) => {
      if (isInitialScroll.current) return;
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => {
        const offsetY = e.nativeEvent.contentOffset.y;
        snapToNearest(offsetY);
      }, 80);
    },
    [snapToNearest],
  );

  useEffect(() => {
    return () => {
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    };
  }, []);

  const handleMomentumScrollEnd = useCallback(
    (e: any) => {
      if (isInitialScroll.current) {
        isInitialScroll.current = false;
        return;
      }
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
      const offsetY = e.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(index, items.length - 1));
      onIndexChange(clamped);
    },
    [items.length, onIndexChange],
  );

  const handleItemPress = useCallback(
    (index: number) => {
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
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
      const isSelected = index === selectedIndex;
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
              color: isSelected ? colors.primary : colors.onSurfaceVariant + '55',
            }}
          >
            {item}
          </Text>
        </TouchableOpacity>
      );
    },
    [selectedIndex, colors, handleItemPress],
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
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
          borderWidth: 1,
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
        onScroll={handleScroll}
        scrollEventThrottle={100}
        initialScrollIndex={selectedIndex}
        style={{ zIndex: 1 }}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
      />
    </View>
  );
}

export function DateTimePickerModal({ visible, value, onClose, onConfirm }: DateTimePickerModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const gradientColors = colors.gradient.primary;

  const [useNow, setUseNow] = useState(true);
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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
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
            <Text style={[typography.titleLg, { color: colors.onSurface }]}>Seleccionar Fecha y Hora</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setUseNow(!useNow)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: spacing.md,
              borderRadius: borderRadius.xl,
              backgroundColor: useNow ? colors.primaryContainer + '15' : colors.surfaceContainerHigh,
              borderWidth: 1,
              borderColor: useNow ? colors.primary : 'transparent',
              marginBottom: spacing.md,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: useNow ? colors.primary : colors.onSurfaceVariant }} />
              <View>
                <Text style={[typography.bodyMd, { color: colors.onSurface, fontWeight: '600' }]}>Hoy, ahora mismo</Text>
                <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>Opción recomendada</Text>
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
                  backgroundColor: '#FFFFFF',
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
                  <TouchableOpacity onPress={handlePrevMonth} style={{ padding: 4 }}>
                    <Ionicons name="chevron-back" size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleNextMonth} style={{ padding: 4 }}>
                    <Ionicons name="chevron-forward" size={18} color={colors.primary} />
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
                        style={{
                          width: CELL_SIZE,
                          height: CELL_SIZE,
                          borderRadius: CELL_SIZE / 2,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: selectedDay === day ? colors.primary : 'transparent',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: selectedDay === day ? '700' : '400',
                            color: selectedDay === day ? '#FFFFFF' : colors.onSurface,
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
                    selectedIndex={Math.round(minute / 5)}
                    onIndexChange={(i) => setMinute(i * 5)}
                    colors={colors}
                  />
                  <Text style={[typography.labelMd, { color: colors.onSurfaceVariant, fontSize: 10, marginTop: spacing.xs }]}>Min</Text>
                </View>

                <View style={{ gap: 6, marginLeft: spacing.sm }}>
                  <TouchableOpacity
                    onPress={() => setAmpm('AM')}
                    style={{
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      borderRadius: borderRadius.md,
                      backgroundColor: ampm === 'AM' ? colors.primary + '33' : colors.surfaceContainerHigh,
                      borderWidth: 1,
                      borderColor: ampm === 'AM' ? colors.primary : 'transparent',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: ampm === 'AM' ? colors.primary : colors.onSurfaceVariant }}>AM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setAmpm('PM')}
                    style={{
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      borderRadius: borderRadius.md,
                      backgroundColor: ampm === 'PM' ? colors.primary + '33' : colors.surfaceContainerHigh,
                      borderWidth: 1,
                      borderColor: ampm === 'PM' ? colors.primary : 'transparent',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: ampm === 'PM' ? colors.primary : colors.onSurfaceVariant }}>PM</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity onPress={handleConfirm} activeOpacity={0.8} style={{ marginTop: spacing.xs }}>
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  height: 48,
                  borderRadius: borderRadius.xl,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing.sm,
                }}
              >
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                <Text style={[typography.bodyMd, { color: '#FFFFFF', fontWeight: '700' }]}>Confirmar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
