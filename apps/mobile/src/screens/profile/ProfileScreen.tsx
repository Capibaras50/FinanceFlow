import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Switch, Modal, StyleSheet, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '../../components/ui/GlassCard';
import { Input } from '../../components/ui/Input';
import { GradientButton } from '../../components/ui/GradientButton';
import { getErrorMessage } from '../../utils/format';
import { typography, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../context/SnackbarContext';
import { usersApi } from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import type { RootNavigationProp } from '../../navigation/types';

export function ProfileScreen() {
  const { colors, mode, toggleTheme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<RootNavigationProp>();
  const { user, logout, refreshUser } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [passModal, setPassModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handlePickAvatar = () => {
    Alert.alert('Foto de perfil', 'Selecciona una opción', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cámara',
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) {
            showError('Se requiere permiso de la cámara');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });
          if (!result.canceled) await uploadAvatar(result.assets[0]);
        },
      },
      {
        text: 'Galería',
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) {
            showError('Se requiere permiso de la galería');
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });
          if (!result.canceled) await uploadAvatar(result.assets[0]);
        },
      },
    ]);
  };

  const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
    setUploading(true);
    try {
      const ext = asset.uri.split('.').pop() || 'jpg';
      await usersApi.uploadAvatar({
        uri: asset.uri,
        name: `avatar.${ext}`,
        type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      });
      await refreshUser();
      showSuccess('Foto de perfil actualizada');
    } catch (e) {
      showError(getErrorMessage(e, 'Error al subir la foto'));
    }
    setUploading(false);
  };

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

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return;
    setPassLoading(true);
    try {
      await usersApi.changePassword({ currentPassword, newPassword });
      showSuccess('Contraseña actualizada correctamente');
      setPassModal(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (e) {
      showError(getErrorMessage(e, 'Error al cambiar contraseña'));
    }
    setPassLoading(false);
  };

  const menuItems = [
    { icon: 'chatbubbles' as const, label: 'Asistente IA', screen: 'Chat' as const, desc: 'Pregunta sobre tus finanzas' },
    { icon: 'apps' as const, label: 'Categorías', screen: 'Categories' as const, desc: 'Gestiona tus categorías' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={colors.gradient.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <TouchableOpacity onPress={handlePickAvatar} disabled={uploading}>
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarCircle}
          >
            {user?.profile?.avatarUrl ? (
              <Image source={{ uri: user.profile.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {user?.profile?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            )}
          </LinearGradient>
          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={14} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        <Text style={[typography.headlineMd, { color: '#FFFFFF' }]}>
          {user?.profile?.name || 'Usuario'}
        </Text>
        <Text style={[typography.bodyMd, { color: 'rgba(255,255,255,0.7)', marginTop: spacing.xs }]}>
          {user?.email}
        </Text>
        {uploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}
      </LinearGradient>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: spacing.container }}
        contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: spacing['2xl'], gap: spacing.sm }}
      >
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} onPress={() => navigation.navigate(item.screen)}>
            <GlassCard>
              <View style={s.menuRow}>
                <View style={[s.menuIcon, { backgroundColor: `${colors.primary}15` }]}>
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

        <TouchableOpacity onPress={() => setPassModal(true)}>
          <GlassCard>
            <View style={s.menuRow}>
              <View style={[s.menuIcon, { backgroundColor: `${colors.primary}15` }]}>
                <Ionicons name="lock-closed" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.titleMd, { color: colors.onSurface }]}>
                  Cambiar contraseña
                </Text>
                <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>
                  Actualiza tu contraseña
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceVariant} />
            </View>
          </GlassCard>
        </TouchableOpacity>

        <View style={{ marginTop: spacing.md }}>
          <Text style={[typography.labelMd, { color: colors.onSurfaceVariant, marginBottom: spacing.sm, marginLeft: spacing.xs }]}>
            APARIENCIA
          </Text>
          <GlassCard>
            <View style={s.menuRow}>
              <View style={[s.menuIcon, { backgroundColor: `${colors.primary}15` }]}>
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
            <View style={s.menuRow}>
              <View style={[s.menuIcon, { backgroundColor: `${colors.error}15` }]}>
                <Ionicons name="log-out" size={20} color={colors.error} />
              </View>
              <Text style={[typography.titleMd, { color: colors.error, flex: 1 }]}>
                Cerrar Sesión
              </Text>
            </View>
          </GlassCard>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={passModal} transparent animationType="slide" onRequestClose={() => setPassModal(false)}>
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { backgroundColor: colors.surface, paddingBottom: insets.bottom + spacing.md }]}>
            <View style={[s.modalHandle, { backgroundColor: colors.outlineVariant }]} />
            <Text style={[typography.titleLg, { color: colors.onSurface, marginBottom: spacing.lg }]}>
              Cambiar contraseña
            </Text>
            <Input
              label="Contraseña actual"
              placeholder="••••••••"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            <View style={{ height: spacing.md }} />
            <Input
              label="Nueva contraseña"
              placeholder="••••••••"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
              <GradientButton title="Cancelar" variant="outlined" onPress={() => setPassModal(false)} style={{ flex: 1 }} />
              <GradientButton title="Guardar" onPress={handleChangePassword} style={{ flex: 1 }} disabled={passLoading || !currentPassword || !newPassword} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: 60,
    paddingBottom: spacing['2xl'],
    alignItems: 'center',
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 22,
  },
  avatarText: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 4,
    right: -4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
});

const s = StyleSheet.create({
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    padding: spacing.container,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
});
