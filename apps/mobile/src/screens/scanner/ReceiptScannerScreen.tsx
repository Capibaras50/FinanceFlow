import { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
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
import { receiptsApi } from '../../services/api';

const IS_WEB = Platform.OS === 'web';

const MAX_DIMENSION = 1024;
const JPEG_QUALITY = 0.7;

async function compressImage(uri: string): Promise<{ uri: string; file?: File }> {
  if (IS_WEB) {
    const img = new window.Image();
    img.src = uri;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
    });
    let { width, height } = img;
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, width, height);
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/jpeg', JPEG_QUALITY);
    });
    const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
    return { uri: URL.createObjectURL(blob), file };
  }

  const result = await manipulateAsync(
    uri,
    [{ resize: { width: MAX_DIMENSION, height: MAX_DIMENSION } }],
    { compress: JPEG_QUALITY, format: SaveFormat.JPEG }
  );
  return { uri: result.uri };
}

function parseUploadError(body: string, fallback: string): string {
  try {
    const data = JSON.parse(body) as Record<string, unknown>;
    const msg = data?.message;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) return msg.join(', ');
    return fallback;
  } catch {
    if (body.startsWith('<')) return 'El servidor devolvió un error HTML. Verifica la URL del backend.';
    return body || fallback;
  }
}

export function ReceiptScannerScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { showError, showSuccess } = useSnackbar();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const processCaptured = async (uri: string) => {
    const compressed = await compressImage(uri);
    setCapturedImage(compressed.uri);
    setCompressedFile(compressed.file ?? null);
    setShowConfirm(true);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      if (photo?.uri) {
        await processCaptured(photo.uri);
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
      quality: 0.9,
    });
    if (!result.canceled && result.assets?.[0]) {
      await processCaptured(result.assets[0].uri);
    }
  };

  const handleWebInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    await processCaptured(blobUrl);
    e.target.value = '';
  }, []);

  const handleScan = async () => {
    if (!capturedImage) return;
    setUploading(true);
    try {
      if (IS_WEB) {
        let file = compressedFile;
        if (!file) {
          const compressed = await compressImage(capturedImage);
          if (compressed.file) {
            file = compressed.file;
          } else {
            const res = await fetch(compressed.uri);
            const blob = await res.blob();
            file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
          }
        }
        const formData = new FormData();
        formData.append('receipt', file);
        await receiptsApi.uploadFile(formData);
      } else {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';
        const token = getTokenSync();
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const result = await uploadAsync(`${apiUrl}/receipts`, capturedImage, {
          fieldName: 'receipt',
          httpMethod: 'POST',
          uploadType: FileSystemUploadType.MULTIPART,
          headers,
          mimeType: 'image/jpeg',
        });
        if (result.status >= 400) {
          throw { message: parseUploadError(result.body, 'Upload failed'), statusCode: result.status };
        }
      }
      showSuccess('Recibo enviado. El asistente IA lo está procesando.');
      navigation.goBack();
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'No se pudo procesar el recibo');
      showError(msg.includes('413') ? 'La imagen es muy pesada. Intenta con otra foto.' : msg);
    } finally {
      setUploading(false);
    }
  };

  const resetConfirm = () => {
    setShowConfirm(false);
    setCapturedImage(null);
    setCompressedFile(null);
  };

  const renderConfirm = () => (
    <GlassCard
      glowColor={colors.primaryContainer}
      style={IS_WEB
        ? { position: 'absolute', bottom: insets.bottom + spacing.md, left: spacing.container, right: spacing.container }
        : { position: 'absolute', bottom: insets.bottom + spacing.md, left: spacing.container, right: spacing.container }
      }
    >
      <Image
        source={{ uri: capturedImage! }}
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
            onPress={resetConfirm}
            style={{ flex: 1 }}
          />
          <View style={{ flex: 1 }}>
            <GradientButton title="Escanear" onPress={handleScan} />
          </View>
        </View>
      )}
    </GlassCard>
  );

  const renderBottomActions = (onCamera: () => void, onGallery: () => void) => (
    <View style={IS_WEB
      ? { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, paddingHorizontal: spacing.container }
      : { position: 'absolute', bottom: insets.bottom + spacing.md, left: 0, right: 0, alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.container }
    }>
      <TouchableOpacity onPress={onCamera}>
        <LinearGradient
          colors={colors.gradient.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: colors.primaryContainer,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Ionicons name="camera" size={32} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
      <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant }]}>
        Toma una foto del recibo
      </Text>
      <View style={{ width: '100%', maxWidth: 280 }}>
        <GradientButton
          title="O selecciona de galería"
          onPress={onGallery}
          variant="outlined"
        />
      </View>
    </View>
  );

  if (IS_WEB) {
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

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleWebInput}
          style={{ display: 'none' }}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleWebInput}
          style={{ display: 'none' }}
        />

        {showConfirm && capturedImage
          ? renderConfirm()
          : renderBottomActions(
              () => cameraInputRef.current?.click(),
              () => galleryInputRef.current?.click()
            )
        }
      </View>
    );
  }

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
        />
      </View>

      {showConfirm && capturedImage
        ? renderConfirm()
        : renderBottomActions(takePicture, pickFromGallery)
      }
    </View>
  );
}
