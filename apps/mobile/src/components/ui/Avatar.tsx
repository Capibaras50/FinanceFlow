import { View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { typography } from '../../theme';
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
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (avatarUrl) {
    return (
      <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }}>
        <Image source={{ uri: avatarUrl }} style={{ width: size, height: size }} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={colors.gradient.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: '#FFFFFF',
          fontFamily: typography.titleMd.fontFamily,
          fontWeight: '700',
          fontSize: Math.round(size * 0.32),
          letterSpacing: 0.5,
        }}
      >
        {initials || '?'}
      </Text>
    </LinearGradient>
  );
}
