import { View, Text, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../../components/ui/GlassCard';
import { typography, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';

export function ProfileScreen({ navigation }: any) {
  const { colors, mode, toggleTheme, isDark } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: logout },
      ]
    );
  };

  const menuItems = [
    { icon: 'chatbubbles' as const, label: 'Asistente IA', screen: 'Chat', desc: 'Pregunta sobre tus finanzas' },
    { icon: 'apps' as const, label: 'Categorías', screen: 'Categories', desc: 'Gestiona tus categorías' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={colors.gradient.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: 60, paddingBottom: spacing['2xl'], alignItems: 'center' }}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 88,
            height: 88,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.md,
            borderWidth: 2,
            borderColor: 'rgba(255,255,255,0.3)',
          }}
        >
          <Text style={{ fontSize: 36, color: '#FFFFFF', fontWeight: '700' }}>
            {user?.profile?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </LinearGradient>
        <Text style={[typography.headlineMd, { color: '#FFFFFF' }]}>
          {user?.profile?.name || 'Usuario'}
        </Text>
        <Text style={[typography.bodyMd, { color: 'rgba(255,255,255,0.7)', marginTop: spacing.xs }]}>
          {user?.email}
        </Text>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: spacing.container }}
        contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: spacing['2xl'], gap: spacing.sm }}
      >
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} onPress={() => navigation.navigate(item.screen)}>
            <GlassCard>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: `${colors.primary}15`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={item.icon} size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.titleMd, { color: colors.onSurface }]}>
                    {item.label}
                  </Text>
                  <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>
                    {item.desc}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceVariant} />
              </View>
            </GlassCard>
          </TouchableOpacity>
        ))}

        <View style={{ marginTop: spacing.md }}>
          <Text style={[typography.labelMd, { color: colors.onSurfaceVariant, marginBottom: spacing.sm, marginLeft: spacing.xs }]}>
            APARIENCIA
          </Text>
          <GlassCard>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: `${colors.primary}15`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.titleMd, { color: colors.onSurface }]}>
                  Modo {isDark ? 'Oscuro' : 'Claro'}
                </Text>
                <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>
                  {isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.surfaceContainerHighest, true: colors.primary + '60' }}
                thumbColor={isDark ? colors.primary : colors.onSurfaceVariant}
              />
            </View>
          </GlassCard>
        </View>

        <TouchableOpacity onPress={handleLogout} style={{ marginTop: spacing.md }}>
          <GlassCard style={{ borderColor: `${colors.error}40` }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: `${colors.error}15`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="log-out" size={20} color={colors.error} />
              </View>
              <Text style={[typography.titleMd, { color: colors.error, flex: 1 }]}>
                Cerrar Sesión
              </Text>
            </View>
          </GlassCard>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
