import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Animated, Easing, StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import { borderRadius, layout, motion, spacing, strokeWidth } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export type SkeletonTone = 'expense' | 'earning' | 'mixed' | 'neutral';

// Keep the shimmer inside the surface family: a full-opacity shine reads as a
// white flash, especially in the light palette.
const SHIMMER_MIN = 0.08;
const SHIMMER_MAX = 0.36;

function useIndexes(count: number) {
  return useMemo(() => Array.from({ length: count }, (_, index) => index), [count]);
}

function toneColor(tone: SkeletonTone, index: number, colors: ReturnType<typeof useTheme>['colors']) {
  if (tone === 'neutral') return colors.stroke;
  if (tone === 'earning') return colors.success;
  if (tone === 'mixed') return index % 2 === 1 ? colors.success : colors.error;
  return colors.error;
}

/** A single shaped loading block. Never exposed to screen readers individually. */
export function SkeletonBlock({ width = '100%', height = 16, radius = borderRadius.sm, style }: SkeletonProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const highlight = useRef(new Animated.Value(SHIMMER_MIN)).current;
  const halfShimmer = motion.shimmer / 2;

  useEffect(() => {
    if (reduceMotion) {
      highlight.setValue(SHIMMER_MIN);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(highlight, {
          toValue: SHIMMER_MAX,
          duration: halfShimmer,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(highlight, {
          toValue: SHIMMER_MIN,
          duration: halfShimmer,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [halfShimmer, highlight, reduceMotion]);

  return (
    <View
      accessible={false}
      style={[
        styles.base,
        { width, height, borderRadius: radius, backgroundColor: colors.skeletonBase },
        style,
      ]}
    >
      <Animated.View
        accessible={false}
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: radius, backgroundColor: colors.skeletonShine, opacity: highlight },
        ]}
      />
    </View>
  );
}

export function SkeletonLine({ width, height = 12, radius = borderRadius.sm, style }: SkeletonProps) {
  return <SkeletonBlock width={width} height={height} radius={radius} style={style} />;
}

export function SkeletonCircle({ size = 48, style }: { size?: number; style?: StyleProp<ViewStyle> }) {
  return <SkeletonBlock width={size} height={size} radius={borderRadius.full} style={style} />;
}

/** Square plate used by `Glyph` and most list icons (unlike an avatar circle). */
export function SkeletonSquare({
  size = layout.glyphSize,
  radius = borderRadius.md,
  style,
}: {
  size?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return <SkeletonBlock width={size} height={size} radius={radius} style={style} />;
}

interface SkeletonRowsProps {
  rows?: number;
  style?: StyleProp<ViewStyle>;
}

/** Generic list fallback. Screens with bespoke rows use their named primitive. */
export function SkeletonRows({ rows = 3, style }: SkeletonRowsProps) {
  const indexes = useIndexes(rows);
  return (
    <View accessible={false} style={[styles.rows, style]}>
      {indexes.map((index) => (
        <View accessible={false} key={index} style={styles.row}>
          <SkeletonSquare size={layout.glyphSize} />
          <View accessible={false} style={styles.rowText}>
            <SkeletonLine width="72%" height={21} />
            <SkeletonLine width="46%" height={19} />
          </View>
          <SkeletonLine width={64} height={22} />
        </View>
      ))}
    </View>
  );
}

export function SkeletonBalance({ style }: { style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return (
    <View accessible={false} style={[styles.balance, style]}>
      <SkeletonLine width={110} height={16} />
      <SkeletonLine width="68%" height={48} radius={borderRadius.md} style={{ marginTop: spacing.xs }} />
      <View accessible={false} style={{ height: strokeWidth.thick, backgroundColor: colors.strokeStrong, marginTop: spacing.md }} />
      <View accessible={false} style={[styles.meter, { marginTop: spacing.md }]}>
        <View accessible={false} style={[styles.meterTrack, { backgroundColor: colors.surfaceContainerHighest }]}>
          <SkeletonBlock width="62%" height={10} radius={borderRadius.full} />
        </View>
        <View accessible={false} style={[styles.meterTrack, { backgroundColor: colors.surfaceContainerHighest }]}>
          <SkeletonBlock width="38%" height={10} radius={borderRadius.full} />
        </View>
      </View>
    </View>
  );
}

interface SkeletonScreenProps {
  label?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Announces loading once; inner shapes are decorative to assistive tech. */
export function SkeletonScreen({
  label = 'Cargando tus datos',
  children,
  style,
}: SkeletonScreenProps) {
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
      accessibilityLabel={label}
      style={[styles.screen, style]}
    >
      {children}
    </View>
  );
}

/** Home hero: same card, Dial circle, headline, rule, meter and legend as `BalanceHero`. */
export function SkeletonHero({
  label = 'Cargando saldo',
  style,
}: {
  label?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <SkeletonScreen
      label={label}
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: colors.strokeStrong,
          borderWidth: strokeWidth.thick,
          borderRadius: borderRadius.xl,
          padding: spacing.lg,
          gap: spacing.md,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <View accessible={false} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: strokeWidth.thick, backgroundColor: colors.primarySolid }} />
      <View accessible={false} style={styles.heroHead}>
        <SkeletonLine width={96} height={18} />
        <SkeletonCircle size={72} />
      </View>
      <SkeletonLine width="68%" height={48} radius={borderRadius.md} />
      <View accessible={false} style={{ height: strokeWidth.thick, borderRadius: strokeWidth.thick, backgroundColor: colors.strokeStrong }} />
      <View accessible={false} style={styles.heroMeter}>
        <View accessible={false} style={[styles.meterTrack, { backgroundColor: colors.surfaceContainerHighest }]}>
          <SkeletonBlock width="62%" height={10} radius={borderRadius.full} />
        </View>
        <View accessible={false} style={[styles.meterTrack, { backgroundColor: colors.surfaceContainerHighest }]}>
          <SkeletonBlock width="38%" height={10} radius={borderRadius.full} />
        </View>
      </View>
      <View accessible={false} style={styles.heroLegend}>
        <SkeletonLine width="34%" height={19} />
        <SkeletonLine width="34%" height={19} />
      </View>
    </SkeletonScreen>
  );
}

/** Two-column outstanding-debt card used on Home. */
export function SkeletonDebtSummary({
  label = 'Cargando deudas',
  style,
}: {
  label?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <SkeletonScreen
      label={label}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'stretch',
          backgroundColor: colors.surface,
          borderWidth: strokeWidth.medium,
          borderColor: colors.stroke,
          borderRadius: borderRadius.md,
          padding: spacing.md,
          minHeight: 74,
        },
        style,
      ]}
    >
      <View accessible={false} style={styles.summaryColumn}>
        <SkeletonLine width={72} height={16} />
        <SkeletonLine width="84%" height={22} />
      </View>
      <View accessible={false} style={{ width: strokeWidth.medium, backgroundColor: colors.strokeStrong, marginHorizontal: spacing.lg }} />
      <View accessible={false} style={styles.summaryColumn}>
        <SkeletonLine width={44} height={16} />
        <SkeletonLine width="84%" height={22} />
      </View>
    </SkeletonScreen>
  );
}

function SkeletonTransactionCard({ tone, index }: { tone: SkeletonTone; index: number }) {
  const { colors } = useTheme();
  return (
    <View
      accessible={false}
      style={{
        backgroundColor: colors.surfaceContainerHigh,
        borderColor: toneColor(tone, index, colors),
        borderWidth: strokeWidth.thick,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
      }}
    >
      <View accessible={false} style={styles.cardBody}>
        <SkeletonSquare size={layout.glyphSize} />
        <View accessible={false} style={styles.cardText}>
          <SkeletonLine width="68%" height={22} />
          <SkeletonLine width="48%" height={19} />
        </View>
        <View accessible={false} style={styles.cardAmount}>
          <SkeletonLine width={92} height={22} />
          <SkeletonLine width={56} height={19} />
        </View>
      </View>
    </View>
  );
}

export function SkeletonTransactionRows({
  rows = 4,
  tone = 'mixed',
  label = 'Cargando transacciones…',
  style,
}: SkeletonRowsProps & { tone?: SkeletonTone; label?: string }) {
  const indexes = useIndexes(rows);
  return (
    <SkeletonScreen label={label} style={[styles.cardList, style]}>
      {indexes.map((index) => (
        <SkeletonTransactionCard key={index} tone={tone} index={index} />
      ))}
    </SkeletonScreen>
  );
}

function SkeletonDebtCard({ tone, index }: { tone: SkeletonTone; index: number }) {
  const { colors } = useTheme();
  const accent = toneColor(tone, index, colors);
  return (
    <View
      accessible={false}
      style={{
        backgroundColor: colors.surfaceContainerHigh,
        borderColor: colors.stroke,
        borderWidth: strokeWidth.medium,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
      }}
    >
      <View accessible={false} style={{ position: 'absolute', left: 0, top: 12, bottom: 12, width: strokeWidth.thick, backgroundColor: accent }} />
      <View accessible={false} style={styles.cardBody}>
        <SkeletonSquare size={layout.glyphSize} style={{ borderWidth: strokeWidth.medium, borderColor: accent }} />
        <View accessible={false} style={styles.cardText}>
          <SkeletonLine width="68%" height={22} />
          <SkeletonLine width="58%" height={19} />
          <SkeletonLine width="40%" height={19} />
        </View>
        <View accessible={false} style={styles.cardAmount}>
          <SkeletonLine width={92} height={22} />
          <SkeletonBlock width={68} height={28} radius={borderRadius.sm} />
        </View>
      </View>
    </View>
  );
}

export function SkeletonDebtRows({
  rows = 3,
  tone = 'mixed',
  label = 'Cargando deudas…',
  style,
}: SkeletonRowsProps & { tone?: SkeletonTone; label?: string }) {
  const indexes = useIndexes(rows);
  return (
    <SkeletonScreen label={label} style={[styles.cardList, style]}>
      {indexes.map((index) => <SkeletonDebtCard key={index} tone={tone} index={index} />)}
    </SkeletonScreen>
  );
}

export function SkeletonCategoryRows({
  rows = 1,
  label = 'Cargando categorías…',
  style,
}: SkeletonRowsProps & { label?: string }) {
  const { colors } = useTheme();
  const indexes = useIndexes(rows);
  return (
    <SkeletonScreen label={label} style={[styles.rows, style]}>
      {indexes.map((index) => (
        <View
          accessible={false}
          key={index}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            paddingVertical: spacing.md,
            borderBottomWidth: strokeWidth.medium,
            borderBottomColor: colors.outlineVariant,
          }}
        >
          <SkeletonSquare size={44} style={{ borderWidth: strokeWidth.medium, borderColor: colors.outlineVariant }} />
          <View accessible={false} style={styles.cardText}>
            <SkeletonLine width="56%" height={21} />
            <SkeletonLine width="38%" height={19} />
          </View>
          <SkeletonLine width={80} height={21} />
          <SkeletonBlock width={28} height={28} radius={borderRadius.sm} />
        </View>
      ))}
    </SkeletonScreen>
  );
}

export function SkeletonMovementRows({
  rows = 4,
  label = 'Cargando movimientos…',
  style,
}: SkeletonRowsProps & { label?: string }) {
  const { colors } = useTheme();
  const indexes = useIndexes(rows);
  return (
    <SkeletonScreen label={label} style={[{ gap: 0 }, style]}>
      {indexes.map((index) => (
        <View
          accessible={false}
          key={index}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            paddingVertical: spacing.md,
            borderBottomWidth: index === rows - 1 ? 0 : strokeWidth.medium,
            borderBottomColor: colors.outlineVariant,
          }}
        >
          <SkeletonSquare size={40} radius={borderRadius.sm} style={{ borderWidth: strokeWidth.medium, borderColor: colors.outlineVariant }} />
          <View accessible={false} style={styles.cardText}>
            <SkeletonLine width="58%" height={21} />
            <SkeletonLine width="40%" height={19} />
          </View>
          <SkeletonLine width={78} height={21} />
        </View>
      ))}
    </SkeletonScreen>
  );
}

export function SkeletonWalletCards({
  count = 2,
  label = 'Cargando carteras…',
  style,
}: {
  count?: number;
  label?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const accents = [colors.primary, colors.secondary, colors.success, colors.tertiary];
  const indexes = useIndexes(count);
  return (
    <SkeletonScreen label={label} style={[{ flexDirection: 'row', gap: spacing.md }, style]}>
      {indexes.map((index) => (
        <View
          accessible={false}
          key={index}
          style={{
            width: 170,
            gap: spacing.sm,
            padding: spacing.md,
            backgroundColor: colors.surface,
            borderRadius: borderRadius.md,
            borderWidth: strokeWidth.medium,
            borderColor: colors.outlineVariant,
          }}
        >
          <SkeletonSquare
            size={40}
            radius={borderRadius.sm}
            style={{ borderWidth: strokeWidth.medium, borderColor: accents[index % accents.length] }}
          />
          <SkeletonLine width="70%" height={16} />
          <SkeletonLine width="86%" height={22} />
          <View accessible={false} style={{ flexDirection: 'row', gap: spacing.sm }}>
            <SkeletonLine width={64} height={19} />
            <SkeletonLine width={64} height={19} />
          </View>
        </View>
      ))}
    </SkeletonScreen>
  );
}

/** Categories summary: label, headline, real outline rule and breakdown tracks. */
export function SkeletonCategorySummary({
  rows = 3,
  label = 'Cargando resumen de categorías',
  style,
}: SkeletonRowsProps & { label?: string }) {
  const { colors } = useTheme();
  const indexes = useIndexes(rows);
  return (
    <SkeletonScreen label={label} style={[{ marginBottom: spacing.lg }, style]}>
      <SkeletonLine width={110} height={16} />
      <SkeletonLine width="68%" height={48} style={{ marginTop: spacing.xs }} />
      <View accessible={false} style={{ height: strokeWidth.medium, backgroundColor: colors.outline, marginTop: spacing.md }} />
      <View accessible={false} style={{ gap: spacing.sm, marginTop: spacing.md }}>
        {indexes.map((index) => (
          <View accessible={false} key={index} style={{ gap: spacing.xs }}>
            <View accessible={false} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View accessible={false} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1 }}>
                <SkeletonBlock width={8} height={8} radius={borderRadius.sm} />
                <SkeletonLine width="46%" height={19} />
              </View>
              <SkeletonLine width={64} height={19} />
            </View>
            <View accessible={false} style={{ height: strokeWidth.medium, borderRadius: borderRadius.full, backgroundColor: colors.surfaceContainerHighest, overflow: 'hidden' }}>
              <SkeletonBlock width={index % 2 === 0 ? '62%' : '38%'} height={strokeWidth.medium} radius={borderRadius.full} />
            </View>
          </View>
        ))}
      </View>
    </SkeletonScreen>
  );
}

export function SkeletonChatBubble({
  role = 'assistant',
  lines = 2,
  width,
}: {
  role?: 'user' | 'assistant';
  lines?: number;
  width?: DimensionValue;
}) {
  const { colors } = useTheme();
  const isUser = role === 'user';
  const indexes = useIndexes(lines);
  return (
    <View
      accessible={false}
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        width: width ?? (isUser ? '68%' : '82%'),
        maxWidth: '80%',
        marginBottom: spacing.md,
      }}
    >
      <View
        accessible={false}
        style={{
          backgroundColor: isUser ? colors.primaryContainer : colors.surfaceContainerHigh,
          borderWidth: strokeWidth.medium,
          borderColor: isUser ? colors.outline : colors.outlineVariant,
          borderRadius: borderRadius.lg,
          borderBottomRightRadius: isUser ? borderRadius.sm : borderRadius.lg,
          padding: spacing.md,
          gap: isUser ? spacing.sm : spacing.xs,
        }}
      >
        {!isUser && (
          <View accessible={false} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs }}>
            <SkeletonBlock width={14} height={14} radius={borderRadius.sm} />
            <SkeletonLine width={96} height={16} />
          </View>
        )}
        {indexes.map((index) => (
          <SkeletonLine key={index} width={index === indexes.length - 1 && indexes.length > 1 ? '76%' : '100%'} height={22} />
        ))}
      </View>
    </View>
  );
}

export function SkeletonContactRows({
  rows = 3,
  label = 'Buscando contactos…',
  style,
}: SkeletonRowsProps & { label?: string }) {
  const { colors } = useTheme();
  const indexes = useIndexes(rows);
  return (
    <SkeletonScreen label={label} style={[styles.cardList, style]}>
      {indexes.map((index) => (
        <View
          accessible={false}
          key={index}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            backgroundColor: colors.surfaceContainerHigh,
            borderWidth: strokeWidth.medium,
            borderColor: colors.stroke,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            marginBottom: spacing.sm,
          }}
        >
          <SkeletonCircle size={44} style={{ borderWidth: strokeWidth.thick, borderColor: colors.outlineVariant }} />
          <SkeletonLine width="56%" height={21} style={{ flex: 1, minWidth: 0 }} />
          <SkeletonBlock width={44} height={44} radius={borderRadius.sm} />
        </View>
      ))}
    </SkeletonScreen>
  );
}

/** Avatar + name + two totals shown in the ContactDetail header while it loads. */
export function SkeletonContactProfile({ label = 'Cargando contacto…' }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <SkeletonScreen
      label={label}
      style={{
        width: '100%',
        maxWidth: layout.readingMaxWidth,
        alignSelf: 'center',
        alignItems: 'center',
        marginTop: spacing.md,
        gap: spacing.sm,
      }}
    >
      <SkeletonCircle size={72} style={{ borderWidth: strokeWidth.thick, borderColor: colors.outlineVariant }} />
      <SkeletonLine width={140} height={28} />
      <View accessible={false} style={{ flexDirection: 'row', gap: spacing.lg, marginTop: spacing.xs }}>
        <View accessible={false} style={{ alignItems: 'center', gap: spacing.xs }}>
          <SkeletonLine width={88} height={16} />
          <SkeletonLine width={104} height={22} />
        </View>
        <View accessible={false} style={{ width: strokeWidth.medium, backgroundColor: colors.outlineVariant }} />
        <View accessible={false} style={{ alignItems: 'center', gap: spacing.xs }}>
          <SkeletonLine width={60} height={16} />
          <SkeletonLine width={104} height={22} />
        </View>
      </View>
    </SkeletonScreen>
  );
}

export function SkeletonDebtDetailHeader({
  paddingTop,
  label = 'Cargando deuda…',
}: {
  paddingTop: number;
  label?: string;
}) {
  const { colors } = useTheme();
  const iconStyle = { borderWidth: strokeWidth.medium, borderColor: colors.outlineVariant };
  return (
    <SkeletonScreen
      label={label}
      style={{
        backgroundColor: colors.surface,
        borderBottomWidth: strokeWidth.medium,
        borderBottomColor: colors.outlineVariant,
        paddingTop,
        paddingBottom: spacing.lg,
        paddingHorizontal: spacing.container,
      }}
    >
      <View accessible={false} style={styles.headerRow}>
        <SkeletonBlock width={40} height={40} radius={borderRadius.md} style={iconStyle} />
        <SkeletonLine width="100%" height={18} style={{ flex: 1, minWidth: 0 }} />
        <SkeletonBlock width={40} height={40} radius={borderRadius.md} style={iconStyle} />
      </View>
      <View accessible={false} style={styles.headerAmount}>
        <SkeletonLine width={104} height={16} />
        <SkeletonLine width="60%" height={36} />
        <SkeletonBlock width={80} height={28} radius={borderRadius.sm} style={{ marginTop: spacing.xs }} />
      </View>
    </SkeletonScreen>
  );
}

export function SkeletonTransactionDetailHeader({
  paddingTop,
  isExpense = true,
  label = 'Cargando transacción…',
}: {
  paddingTop: number;
  isExpense?: boolean;
  label?: string;
}) {
  const { colors } = useTheme();
  const iconStyle = { borderWidth: strokeWidth.medium, borderColor: colors.outlineVariant };
  const toneColor = isExpense ? colors.error : colors.success;
  return (
    <SkeletonScreen
      label={label}
      style={{
        backgroundColor: colors.surface,
        borderBottomWidth: strokeWidth.medium,
        borderBottomColor: colors.outlineVariant,
        paddingTop,
        paddingBottom: spacing.lg,
        paddingHorizontal: spacing.container,
      }}
    >
      <View accessible={false} style={styles.headerRowCompact}>
        <SkeletonBlock width={40} height={40} radius={borderRadius.md} style={iconStyle} />
        <SkeletonLine width="100%" height={18} style={{ flex: 1, minWidth: 0 }} />
        <SkeletonBlock width={40} height={40} radius={borderRadius.md} style={iconStyle} />
        <SkeletonBlock width={40} height={40} radius={borderRadius.md} style={iconStyle} />
      </View>
      <View accessible={false} style={styles.transactionHead}>
        <SkeletonSquare size={48} style={{ borderWidth: strokeWidth.medium, borderColor: toneColor }} />
        <SkeletonLine width={72} height={16} />
        <SkeletonLine width="52%" height={21} />
        <SkeletonLine width="64%" height={36} />
      </View>
    </SkeletonScreen>
  );
}

/** Detail cards: framed for DebtDetail, top-rule rows for TransactionDetail. */
export function SkeletonDetailBody({
  rows = 4,
  actions = 1,
  framed = true,
  actionsLayout = 'stacked',
  label = 'Cargando detalles…',
}: {
  rows?: number;
  actions?: number;
  framed?: boolean;
  actionsLayout?: 'stacked' | 'split';
  label?: string;
}) {
  const { colors } = useTheme();
  const rowIndexes = useIndexes(rows);
  const actionIndexes = useIndexes(actions);
  const split = actionsLayout === 'split';
  return (
    <SkeletonScreen
      label={label}
      style={{
        width: '100%',
        maxWidth: layout.readingMaxWidth,
        alignSelf: 'center',
        paddingHorizontal: spacing.container,
        paddingTop: spacing.lg,
        paddingBottom: spacing['2xl'],
        gap: spacing.lg,
      }}
    >
      <View
        accessible={false}
        style={
          framed
            ? {
                backgroundColor: colors.surfaceContainerHigh,
                borderRadius: borderRadius.lg,
                borderWidth: strokeWidth.medium,
                borderColor: colors.outlineVariant,
                paddingHorizontal: spacing.md,
              }
            : { borderTopWidth: strokeWidth.medium, borderTopColor: colors.outlineVariant }
        }
      >
        <SkeletonLine width={72} height={21} style={{ marginTop: framed ? spacing.md : spacing.sm }} />
        <View accessible={false} style={{ marginTop: spacing.sm }}>
          {rowIndexes.map((index) => (
            <View
              accessible={false}
              key={index}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: layout.touchTarget,
                paddingVertical: spacing.sm,
                borderBottomWidth: strokeWidth.medium,
                borderBottomColor: colors.outlineVariant,
              }}
            >
              <SkeletonLine width="32%" height={22} />
              <SkeletonLine width="44%" height={21} />
            </View>
          ))}
        </View>
      </View>
      <View accessible={false} style={split ? { flexDirection: 'row', gap: spacing.sm } : { gap: spacing.lg }}>
        {actionIndexes.map((index) => (
          <SkeletonBlock
            key={index}
            height={layout.primaryButtonHeight}
            radius={borderRadius.md}
            style={split ? { flex: 1 } : undefined}
          />
        ))}
      </View>
    </SkeletonScreen>
  );
}

/** Body of ContactDetail: section title, pill and debt-card frames. */
export function SkeletonContactDetailBody({ label = 'Cargando contacto…' }: { label?: string }) {
  const debtIndexes = useIndexes(2);
  return (
    <SkeletonScreen
      label={label}
      style={{
        width: '100%',
        maxWidth: layout.readingMaxWidth,
        alignSelf: 'center',
        paddingHorizontal: spacing.container,
        paddingTop: spacing.lg,
        paddingBottom: spacing['2xl'],
        gap: spacing.md,
      }}
    >
      <View accessible={false} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: layout.touchTarget }}>
        <SkeletonLine width="54%" height={22} />
        <SkeletonBlock width={76} height={36} radius={borderRadius.full} />
      </View>
      {debtIndexes.map((index) => <SkeletonDebtCard key={index} tone="mixed" index={index} />)}
    </SkeletonScreen>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden' },
  rows: { gap: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 64,
    paddingVertical: spacing.sm,
  },
  rowText: { flex: 1, minWidth: 0, gap: spacing.sm },
  balance: { gap: 0, paddingVertical: spacing.md },
  screen: { width: '100%', gap: spacing.md },
  heroHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroMeter: { flexDirection: 'row', gap: spacing.sm },
  heroLegend: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryColumn: { flex: 1, minWidth: 0, gap: spacing.xs },
  cardList: { gap: 0 },
  cardBody: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingLeft: spacing.xs },
  cardText: { flex: 1, minWidth: 0, gap: spacing.xs },
  cardAmount: { alignItems: 'flex-end', gap: spacing.sm, minWidth: 92 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, width: '100%', maxWidth: layout.readingMaxWidth, alignSelf: 'center' },
  headerRowCompact: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, width: '100%', maxWidth: layout.readingMaxWidth, alignSelf: 'center' },
  headerAmount: { width: '100%', maxWidth: layout.readingMaxWidth, alignSelf: 'center', marginTop: spacing.lg, gap: spacing.sm },
  transactionHead: { alignItems: 'center', gap: spacing.xs, marginTop: spacing.lg },
  meter: { flexDirection: 'row', gap: spacing.sm },
  meterTrack: { flex: 1, height: 10, borderRadius: borderRadius.full, overflow: 'hidden' },
});
