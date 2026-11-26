import { useId, useState } from 'react';
import { View, TextInput, Text, type TextInputProps } from 'react-native';
import { borderRadius, layout, outlineColor, spacing, strokeWidth, typography } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  prefix?: string;
}

/** Solid, heavy field with a thick focus stroke and a linked error message. */
export function Input({
  label,
  error,
  prefix,
  style,
  onFocus,
  onBlur,
  accessibilityLabel,
  nativeID,
  ...props
}: InputProps) {
  const { colors } = useTheme();
  const generatedId = useId();
  const labelId = `label-${generatedId}`;
  const errorId = `error-${generatedId}`;
  const fieldId = nativeID ?? `field-${generatedId}`;
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.error : focused ? colors.primary : colors.stroke;

  return (
    <View style={{ gap: spacing.sm }}>
      {label && (
        <Text nativeID={labelId} style={[typography.labelLg, { color: colors.onSurfaceVariant }]}>
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: layout.primaryButtonHeight,
          borderRadius: borderRadius.md,
          backgroundColor: colors.surfaceContainerLow,
          borderWidth: focused || error ? strokeWidth.thick : strokeWidth.medium,
          borderColor,
          // Compensate the 2px -> 3px focus border so text does not shift.
          paddingHorizontal: focused || error ? spacing.md - 1 : spacing.md,
          ...(focused ? outlineColor(colors.primary) : {}),
        }}
      >
        {prefix && (
          <Text
            accessible={false}
            style={[
              typography.titleLg,
              {
                width: 20,
                flexShrink: 0,
                textAlign: 'center',
                color: colors.onSurfaceVariant,
                marginRight: spacing.sm,
              },
            ]}
          >
            {prefix}
          </Text>
        )}
        <TextInput
          {...props}
          nativeID={fieldId}
          style={[
            typography.bodyLg,
            { flex: 1, minWidth: 0, color: colors.onSurface, paddingVertical: spacing.sm },
            style,
          ]}
          placeholderTextColor={colors.onSurfaceVariant}
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityLabelledBy={label ? labelId : undefined}
          accessibilityHint={error ?? props.accessibilityHint}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
        />
      </View>
      {error && (
        <Text
          nativeID={errorId}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={[typography.bodySm, { color: colors.error }]}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
