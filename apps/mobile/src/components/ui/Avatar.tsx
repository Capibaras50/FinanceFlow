import { View, Text, Image } from 'react-native';
import { borderRadius, strokeWidth, typography } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: number;
}

export function Avatar({ name, avatarUrl, size = 44 }: AvatarProps) {
  const { colors } = useTheme();
  const initials = name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (avatarUrl) {
    return (
      <View
        accessibilityRole="image"
        accessibilityLabel={`Foto de perfil de ${name}`}
        style={{
          width: size,
          height: size,
          borderRadius: borderRadius.full,
          overflow: 'hidden',
          backgroundColor: colors.surfaceContainerHigh,
          borderWidth: strokeWidth.thick,
          borderColor: colors.outlineVariant,
        }}
      >
        <Image source={{ uri: avatarUrl }} style={{ width: size, height: size }} />
      </View>
    );
  }

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Avatar de ${name}`}
      style={{
        width: size,
        height: size,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primaryContainer,
        borderWidth: strokeWidth.thick,
        borderColor: colors.outline,
      }}
    >
      <Text
        accessible={false}
        maxFontSizeMultiplier={1.4}
        style={[
          typography.titleMd,
          {
            color: colors.primary,
            fontSize: Math.round(size * 0.32),
            letterSpacing: 0.5,
          },
        ]}
      >
        {initials || '?'}
      </Text>
    </View>
  );
}
