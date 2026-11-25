import { useState, Fragment } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FocusFadeIn } from '../../components/ui/FocusFadeIn';
import { Input } from '../../components/ui/Input';
import { GradientButton } from '../../components/ui/GradientButton';
import { getErrorMessage } from '../../utils/format';
import { typography, strokeWidth, spacing, borderRadius, layout } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../context/SnackbarContext';
import { showAlert } from '../../components/ui/AppAlert';
import { uploadAvatarAsync, usersApi } from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import type { RootNavigationProp } from '../../navigation/types';
import { ExportDataSection } from './ExportDataSection';

export function ProfileScreen() {
  const { colors, toggleTheme, isDark } = useTheme();
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
    showAlert({
      title: 'Foto de perfil',
      message: 'Selecciona una opción',
      buttons: [
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
    ],
    });
  };

  const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
    setUploading(true);
    try {
      await uploadAvatarAsync(asset.uri, asset.fileName ?? undefined, asset.mimeType ?? undefined);
      await refreshUser();
      showSuccess('Foto de perfil actualizada');
    } catch (e) {
      showError(getErrorMessage(e, 'Error al subir la foto'));
    }
    setUploading(false);
  };

  const handleLogout = () => {
    showAlert({
      title: 'Cerrar sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
      ],
    });
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
    { icon: 'chatbubbles-outline' as const, label: 'Asistente IA', screen: 'Chat' as const, desc: 'Pregunta sobre tus finanzas' },
    { icon: 'apps-outline' as const, label: 'Categorías', screen: 'Categories' as const, desc: 'Gestiona tus categorías' },
  ];

  return (
    <FocusFadeIn>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          style={[
            s.header,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.outlineVariant,
              paddingTop: insets.top + spacing.md,
            },
          ]}
        >
          <TouchableOpacity
            onPress={handlePickAvatar}
            disabled={uploading}
            style={s.avatarButton}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel="Cambiar foto de perfil"
            accessibilityHint="Abre la cámara o la galería"
            accessibilityState={{ disabled: uploading }}
          >
            <View
              style={[
                s.avatar,
                { backgroundColor: colors.primaryContainer, borderColor: colors.outline },
              ]}
            >
              {user?.profile?.avatarUrl ? (
                <Image source={{ uri: user.profile.avatarUrl }} style={s.avatarImage} />
              ) : (
                <Text style={[typography.headlineMd, { color: colors.primary }]}>
                  {user?.profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              )}
              {uploading && (
                <View
                  accessible={false}
                  style={[StyleSheet.absoluteFill, { backgroundColor: colors.surfaceContainerHighest, opacity: 0.9 }]}
                >
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              )}
            </View>
            <View
              accessible={false}
              style={[
                s.cameraBadge,
                { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outlineVariant },
              ]}
            >
              <Ionicons name="camera-outline" size={14} color={colors.primary} />
            </View>
          </TouchableOpacity>

          <View style={{ flex: 1, paddingLeft: spacing.md }}>
            <Text accessibilityRole="header" style={[typography.headlineSm, { color: colors.onSurface }]}>
              {user?.profile?.name || 'Usuario'}
            </Text>
            <Text style={[typography.bodySm, { color: colors.onSurfaceVariant, marginTop: spacing.xs }]}>
              {user?.email}
            </Text>
          </View>
        </View>

        <ScrollView
          style={s.scroll}
          contentContainerStyle={{
            paddingTop: spacing.lg,
            paddingBottom: insets.bottom + spacing['2xl'],
            paddingHorizontal: spacing.container,
            gap: spacing.lg,
          }}
        >
          <View style={[s.group, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
            {menuItems.map((item, index) => (
              <Fragment key={item.screen}>
                {index > 0 && <View accessible={false} style={[s.separator, { backgroundColor: colors.outlineVariant }]} />}
                <TouchableOpacity
                  onPress={() => navigation.navigate(item.screen)}
                  activeOpacity={0.7}
                  hitSlop={4}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  accessibilityHint={item.desc}
                >
                  <View style={s.row}>
                    <View style={[s.rowIcon, { backgroundColor: colors.surfaceContainerHighest }]}>
                      <Ionicons name={item.icon} size={20} color={colors.primary} accessible={false} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[typography.titleMd, { color: colors.onSurface }]}>
                        {item.label}
                      </Text>
                      <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>
                        {item.desc}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceVariant} accessible={false} />
                  </View>
                </TouchableOpacity>
              </Fragment>
            ))}

            <View accessible={false} style={[s.separator, { backgroundColor: colors.outlineVariant }]} />
            <TouchableOpacity
              onPress={() => setPassModal(true)}
              activeOpacity={0.7}
              hitSlop={4}
              accessibilityRole="button"
              accessibilityLabel="Cambiar contraseña"
              accessibilityHint="Actualiza tu contraseña"
            >
              <View style={s.row}>
                <View style={[s.rowIcon, { backgroundColor: colors.surfaceContainerHighest }]}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.primary} accessible={false} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.titleMd, { color: colors.onSurface }]}>
                    Cambiar contraseña
                  </Text>
                  <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>
                    Actualiza tu contraseña
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceVariant} accessible={false} />
              </View>
            </TouchableOpacity>
          </View>

          <ExportDataSection />

          <View>
            <Text accessibilityRole="header" style={[typography.labelMd, { color: colors.onSurfaceVariant, marginBottom: spacing.xs, paddingLeft: spacing.xs }]}>
              Apariencia
            </Text>
            <View style={[s.group, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <View style={s.row}>
                <View style={[s.rowIcon, { backgroundColor: colors.surfaceContainerHighest }]}>
                  <Ionicons name={isDark ? 'moon-outline' : 'sunny-outline'} size={20} color={colors.primary} accessible={false} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.titleMd, { color: colors.onSurface }]}>
                    Modo {isDark ? 'oscuro' : 'claro'}
                  </Text>
                  <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>
                    {isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
                  </Text>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: colors.surfaceContainerHighest, true: colors.primaryContainer }}
                  thumbColor={isDark ? colors.primary : colors.onSurfaceVariant}
                  accessibilityLabel="Modo oscuro"
                  accessibilityState={{ checked: isDark }}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.7}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
            accessibilityHint="Cierra la sesión actual"
          >
            <View style={[s.group, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
              <View style={s.row}>
                <View style={[s.rowIcon, { backgroundColor: colors.errorContainer }]}>
                  <Ionicons name="log-out-outline" size={20} color={colors.error} accessible={false} />
                </View>
                <Text style={[typography.titleMd, { color: colors.error, flex: 1 }]}>
                  Cerrar sesión
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>

        <Modal visible={passModal} transparent animationType="slide" onRequestClose={() => setPassModal(false)}>
          <View style={s.modalOverlay}>
            <View
              accessible={false}
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: isDark ? colors.surfaceContainerLowest : colors.onBackground,
                  opacity: 0.7,
                },
              ]}
            />
            <View
              accessibilityViewIsModal
              style={[
                s.modalContent,
                {
                  backgroundColor: colors.surface,
                  borderTopColor: colors.outlineVariant,
                  paddingBottom: insets.bottom + spacing.md,
                },
              ]}
            >
              <View accessible={false} style={[s.modalHandle, { backgroundColor: colors.outlineVariant }]} />
              <Text accessibilityRole="header" style={[typography.titleLg, { color: colors.onSurface, marginBottom: spacing.lg }]}>
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
              <View style={s.modalActions}>
                <GradientButton title="Cancelar" variant="outlined" onPress={() => setPassModal(false)} style={{ flex: 1 }} />
                <GradientButton
                  title="Guardar"
                  onPress={handleChangePassword}
                  style={{ flex: 1 }}
                  loading={passLoading}
                  disabled={!currentPassword || !newPassword}
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </FocusFadeIn>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.container,
    paddingBottom: spacing.lg,
    borderBottomWidth: strokeWidth.medium,
  },
  avatarButton: {
    position: 'relative',
    minWidth: layout.touchTarget,
    minHeight: layout.touchTarget,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: strokeWidth.medium,
  },
  avatarImage: {
    width: 64,
    height: 64,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: -spacing.xs,
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: strokeWidth.medium,
  },
  scroll: {
    flex: 1,
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
  },
  group: {
    borderRadius: borderRadius.lg,
    borderWidth: strokeWidth.medium,
    paddingHorizontal: spacing.md,
  },
  separator: {
    height: strokeWidth.medium,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 64,
    paddingVertical: spacing.sm,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    borderTopWidth: strokeWidth.medium,
    padding: spacing.container,
    maxWidth: layout.readingMaxWidth,
    width: '100%',
    alignSelf: 'center',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: borderRadius.sm,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
