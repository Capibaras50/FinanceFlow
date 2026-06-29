import { View, TextInput, Text, type TextInputProps } from 'react-native';
import { borderRadius, typography, spacing } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  prefix?: string;
}

export function Input({ label, error, prefix, style, ...props }: InputProps) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: spacing.xs }}>
      {label && (
        <Text style={[typography.labelMd, { color: colors.onSurfaceVariant, marginLeft: 4 }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surfaceContainerHigh,
            borderRadius: borderRadius.lg,
            borderWidth: 1,
            borderColor: error ? colors.error : colors.outlineVariant,
            paddingHorizontal: spacing.md,
          },
        ]}
      >
        {prefix && (
          <Text style={[typography.bodyLg, { color: colors.onSurfaceVariant, marginRight: spacing.xs }]}>
            {prefix}
          </Text>
        )}
        <TextInput
          placeholderTextColor={colors.onSurfaceVariant}
          style={[
            typography.bodyLg,
            {
              flex: 1,
              color: colors.onSurface,
              paddingVertical: spacing.md,
            },
            style,
          ]}
          {...props}
        />
      </View>
      {error && (
        <Text style={[typography.bodySm, { color: colors.error, marginLeft: 4 }]}>
          {error}
        </Text>
      )}
    </View>
  );
}
