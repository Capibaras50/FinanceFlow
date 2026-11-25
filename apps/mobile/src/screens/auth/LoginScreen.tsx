import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography, strokeWidth, spacing, borderRadius, layout } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../context/SnackbarContext';
import { Input } from '../../components/ui/Input';
import { Glyph } from '../../components/ui/Glyph';
import { GradientButton } from '../../components/ui/GradientButton';
import { getErrorMessage } from '../../utils/format';
import { hasPendingSharedImage } from '../../services/sharedImage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { AuthNavigationProp } from '../../navigation/types';

export function LoginScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AuthNavigationProp>();
  const { login, loginWithGoogle } = useAuth();
  const { showError } = useSnackbar();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingReceipt, setPendingReceipt] = useState(false);

  // If an image was shared while logged out, the navigator holds it until
  // sign-in — tell the user why they should log in.
  useFocusEffect(
    useCallback(() => {
      setPendingReceipt(hasPendingSharedImage());
    }, [])
  );

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
    } catch (e) {
      showError(getErrorMessage(e, 'Error al iniciar sesión'));
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (e) {
      showError(getErrorMessage(e, 'Error al iniciar sesión con Google'));
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          width: '100%',
          maxWidth: layout.readingMaxWidth,
          alignSelf: 'center',
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing['2xl'],
          paddingBottom: insets.bottom + spacing['2xl'],
          paddingHorizontal: spacing.container,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.header}>
          <View accessible={false} style={s.logoMark}>
            <Glyph name="wallet" tone="primary" size={64} active />
          </View>
          <Text accessibilityRole="header" style={[typography.headlineLg, { color: colors.onSurface }]}>
            Finance Flow
          </Text>
          <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant, marginTop: spacing.xs }]}>
            Tu dinero, con inteligencia
          </Text>
          {pendingReceipt && (
            <View
              style={[
                s.receiptNotice,
                {
                  backgroundColor: colors.secondaryContainer,
                  borderColor: colors.outline,
                },
              ]}
              accessibilityRole="alert"
            >
              <Ionicons
                name="receipt-outline"
                size={18}
                color={colors.secondary}
                accessible={false}
              />
              <Text style={[typography.bodySm, { color: colors.onSecondaryContainer, flexShrink: 1 }]}>
                Tienes un recibo compartido — inicia sesión para escanearlo
              </Text>
            </View>
          )}
        </View>

        <View style={s.form}>
          <Input
            label="Correo electrónico"
            placeholder="tu@correo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View>
            <Input
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={s.eyeIcon}
              hitSlop={4}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              accessibilityState={{ selected: showPassword }}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={colors.onSurfaceVariant}
                accessible={false}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={s.forgotLink}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel="¿Olvidaste tu contraseña?"
            accessibilityHint="Abre la recuperación de contraseña"
          >
            <Text style={[typography.bodySm, { color: colors.primary }]}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>
        </View>

        <GradientButton
          title="Iniciar sesión"
          onPress={handleLogin}
          loading={loading}
          disabled={!email || !password}
          style={{ marginTop: spacing.xl }}
        />

        <View style={s.divider}>
          <View style={[s.dividerLine, { backgroundColor: colors.outlineVariant }]} />
          <Text style={[typography.bodySm, { color: colors.onSurfaceVariant, marginHorizontal: spacing.md }]}>
            o
          </Text>
          <View style={[s.dividerLine, { backgroundColor: colors.outlineVariant }]} />
        </View>

        <TouchableOpacity
          onPress={handleGoogleLogin}
          style={[
            s.googleButton,
            {
              backgroundColor: colors.surfaceContainerHigh,
              borderColor: colors.outlineVariant,
              opacity: loading ? 0.6 : 1,
            },
          ]}
          disabled={loading}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel="Continuar con Google"
          accessibilityState={{ disabled: loading, busy: loading }}
        >
          <Ionicons name="logo-google" size={20} color={colors.primary} accessible={false} />
          <Text style={[typography.labelLg, { color: colors.onSurface, marginLeft: spacing.sm }]}>
            Continuar con Google
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={s.registerLink}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel="Registrarse"
          accessibilityHint="Crea una cuenta nueva"
        >
          <Text style={[typography.bodyMd, { color: colors.primary, textDecorationLine: 'underline' }]}>
            Registrarse
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  receiptNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: strokeWidth.medium,
  },
  form: {
    gap: spacing.md,
  },
  eyeIcon: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    minHeight: layout.touchTarget,
    minWidth: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotLink: {
    alignSelf: 'flex-end',
    minHeight: layout.touchTarget,
    justifyContent: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: strokeWidth.medium,
  },
  googleButton: {
    flexDirection: 'row',
    minHeight: layout.touchTarget,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: strokeWidth.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerLink: {
    alignSelf: 'center',
    minHeight: layout.touchTarget,
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
});
