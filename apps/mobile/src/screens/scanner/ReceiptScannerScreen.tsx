import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { uploadAsync, FileSystemUploadType } from 'expo-file-system/legacy';
import { typography, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { GlassCard } from '../../components/ui/GlassCard';
import { GradientButton } from '../../components/ui/GradientButton';
import { useSnackbar } from '../../context/SnackbarContext';
import { useNavigation } from '@react-navigation/native';
import type { RootNavigationProp } from '../../navigation/types';
import { getTokenSync } from '../../services/storage';
import { getErrorMessage } from '../../utils/format';

export function ReceiptScannerScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { showError, showSuccess } = useSnackbar();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo?.uri) {
        setCapturedImage(photo.uri);
        setShowConfirm(true);
      }
    }
  };

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      showError('Se necesita acceso a la galería');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setCapturedImage(result.assets[0].uri);
      setShowConfirm(true);
    }
  };

  const handleScan = async () => {
    if (!capturedImage) return;
    setUploading(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
      const token = getTokenSync();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await uploadAsync(`${apiUrl}/receipts`, capturedImage, {
        fieldName: 'receipt',
        httpMethod: 'POST',
        uploadType: FileSystemUploadType.MULTIPART,
        headers,
        mimeType: 'image/jpeg',
      });
      showSuccess('Recibo enviado. El asistente IA lo está procesando.');
      navigation.goBack();
    } catch (err) {
      showError(getErrorMessage(err, 'No se pudo procesar el recibo'));
    } finally {
      setUploading(false);
    }
  };

  if (!permission) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={[typography.bodyLg, { color: colors.onSurface }]}>Solicitando permisos...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.container }}>
        <Ionicons name="camera-outline" size={48} color={colors.onSurfaceVariant} />
        <Text style={[typography.bodyLg, { color: colors.onSurface, textAlign: 'center', marginTop: spacing.md }]}>
          Necesitamos acceso a la cámara para escanear recibos
        </Text>
        <GradientButton title="Conceder Permiso" onPress={requestPermission} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={colors.gradient.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + spacing.md, paddingBottom: spacing.md, paddingHorizontal: spacing.container }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={[typography.headlineSm, { color: '#FFFFFF', flex: 1 }]}>
            Escanear Recibo
          </Text>
        </View>
      </LinearGradient>

      <View style={{ flex: 1 }}>
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing="back"
        >
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View
              style={{
                width: 250,
                height: 350,
                borderWidth: 2,
                borderColor: colors.tertiary,
                borderRadius: borderRadius.lg,
                backgroundColor: 'transparent',
                shadowColor: colors.tertiary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 6,
              }}
            />
          </View>
        </CameraView>
      </View>

      {showConfirm && capturedImage ? (
        <GlassCard
          glowColor={colors.primaryContainer}
          style={{ position: 'absolute', bottom: insets.bottom + spacing.md, left: spacing.container, right: spacing.container }}
        >
          <Image
            source={{ uri: capturedImage }}
            style={{ width: '100%', height: 120, borderRadius: borderRadius.md, marginBottom: spacing.md }}
            resizeMode="cover"
          />
          <Text style={[typography.titleMd, { color: colors.onSurface, textAlign: 'center', marginBottom: spacing.md }]}>
            ¿Escaneamos este recibo?
          </Text>
          {uploading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <GradientButton
                title="Cancelar"
                variant="outlined"
                onPress={() => { setShowConfirm(false); setCapturedImage(null); }}
                style={{ flex: 1 }}
              />
              <View style={{ flex: 1 }}>
                <GradientButton title="Escanear" onPress={handleScan} />
              </View>
            </View>
          )}
        </GlassCard>
      ) : (
        <View style={{ position: 'absolute', bottom: insets.bottom + spacing.md, left: 0, right: 0, alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.container }}>
          <GradientButton
            title="Seleccionar de galería"
            onPress={pickFromGallery}
            variant="outlined"
            style={{ width: '100%' }}
          />
          <TouchableOpacity onPress={takePicture}>
            <LinearGradient
              colors={colors.gradient.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: colors.primaryContainer,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Ionicons name="camera" size={28} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
          <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>
            O usa la cámara para escanear
          </Text>
        </View>
      )}
    </View>
  );
}
