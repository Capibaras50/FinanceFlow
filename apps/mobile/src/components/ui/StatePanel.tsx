import { memo } from 'react';
import { View, Text, TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native';
import { Glyph } from './Glyph';
import { SkeletonBalance, SkeletonRows, SkeletonLine, SkeletonBlock } from './Skeleton';
import { borderRadius, layout, spacing, strokeWidth, typography } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

export type PanelState = 'loading' | 'empty' | 'error';
export type PanelVariant = 'rows' | 'balance' | 'card' | 'plain';

interface StatePanelProps {
  state: PanelState;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Shape of the loading skeleton. Ignored for empty/error states. */
  variant?: PanelVariant;
  style?: StyleProp<ViewStyle>;
}

const COPY: Record<PanelState, { title: string; message: string; icon: 'document-text' | 'alert-circle' | 'sync' }> = {
  loading: {
    title: 'Cargando…',
    message: 'Estamos obteniendo tus datos.',
    icon: 'sync',
  },
  empty: {
    title: 'Aún no hay nada aquí',
    message: 'Cuando registres información, aparecerá en esta sección.',
    icon: 'document-text',
  },
  error: {
    title: 'No pudimos cargar tus datos',
    message: 'Revisa tu conexión e inténtalo de nuevo.',
    icon: 'alert-circle',
  },
};

function LoadingShape({ variant }: { variant: PanelVariant }) {
  if (variant === 'balance') return <SkeletonBalance />;
  if (variant === 'rows') return <SkeletonRows rows={4} />;
  if (variant === 'plain') return <SkeletonLine width="70%" height={14} />;
  return (
    <View style={{ gap: spacing.md }}>
      <SkeletonBlock height={112} radius={borderRadius.lg} />
      <SkeletonRows rows={3} />
    </View>
  );
}

/** Shared loading / empty / error presentation. Loading always uses shaped skeletons. */
export const StatePanel = memo(function StatePanel({
  state,
  title,
  message,
  actionLabel,
  onAction,
  variant = 'rows',
  style,
}: StatePanelProps) {
  const { colors } = useTheme();
  const copy = COPY[state];

  return (
    <View
      accessible
      accessibilityRole={state === 'error' ? 'alert' : 'text'}
      accessibilityLiveRegion="polite"
      accessibilityLabel={state === 'loading' ? (title ?? copy.title) : `${title ?? copy.title}. ${message ?? copy.message}`}
      accessibilityState={{ busy: state === 'loading' }}
      style={[
        {
          alignItems: 'stretch',
          justifyContent: 'center',
          gap: spacing.md,
          ...(state === 'loading'
            ? { width: '100%' }
            : {
                paddingVertical: spacing.lg,
                paddingHorizontal: spacing.container,
                maxWidth: layout.readingMaxWidth,
                alignSelf: 'center',
                width: '100%',
              }),
        },
        style,
      ]}
    >
      {state === 'loading' ? (
        <LoadingShape variant={variant} />
      ) : (
        <View style={{ alignItems: 'center', gap: spacing.md }}>
          <Glyph
            name={copy.icon}
            tone={state === 'error' ? 'error' : 'primary'}
            size={56}
          />
          <Text
            accessibilityRole="header"
            style={[typography.headlineSm, { color: colors.onSurface, textAlign: 'center' }]}
          >
            {title ?? copy.title}
          </Text>
          <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant, textAlign: 'center' }]}>
            {message ?? copy.message}
          </Text>
          {state === 'error' && onAction && (
            <TouchableOpacity
              onPress={onAction}
              accessibilityRole="button"
              accessibilityLabel={actionLabel ?? 'Reintentar'}
              accessibilityHint="Vuelve a intentar la operación"
              hitSlop={8}
              style={{
                minHeight: layout.touchTarget,
                minWidth: layout.touchTarget,
                justifyContent: 'center',
                paddingHorizontal: spacing.lg,
                borderRadius: borderRadius.md,
                backgroundColor: colors.primarySolid,
                borderWidth: strokeWidth.thick,
                borderColor: colors.primary,
              }}
            >
              <Text style={[typography.labelLg, { color: colors.onPrimarySolid, textAlign: 'center' }]}>
                {actionLabel ?? 'Reintentar'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
});
