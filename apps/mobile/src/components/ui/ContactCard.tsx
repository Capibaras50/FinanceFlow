import { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { Avatar } from './Avatar';
import { typography, spacing } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import type { Profile } from '@finance-flow/shared-types';

interface ContactCardProps {
  profile: Profile;
  subtitle?: string;
  onPress: () => void;
  onLongPress?: () => void;
  onDelete?: () => void;
}

export const ContactCard = memo(function ContactCard({ profile, subtitle, onPress, onLongPress, onDelete }: ContactCardProps) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${profile.name}, ${subtitle}` : profile.name}
    >
      <GlassCard style={{ marginBottom: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Avatar name={profile.name} avatarUrl={profile.avatarUrl} />
          <View style={{ flex: 1 }}>
            <Text style={[typography.titleMd, { color: colors.onSurface }]}>
              {profile.name}
            </Text>
            {subtitle ? (
              <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {onDelete && (
            <TouchableOpacity
              onPress={onDelete}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Eliminar a ${profile.name}`}
              style={{ padding: spacing.xs }}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          )}
          <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceVariant} />
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
});
