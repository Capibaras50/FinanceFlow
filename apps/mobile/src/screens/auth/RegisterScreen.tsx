import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography, strokeWidth, spacing, borderRadius, layout } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../context/SnackbarContext';
import { Input } from '../../components/ui/Input';
import { GradientButton } from '../../components/ui/GradientButton';
import { getErrorMessage } from '../../utils/format';
import { PasswordRequirements, passwordRules } from '../../components/auth/PasswordRequirements';
import { useNavigation } from '@react-navigation/native';
import type { AuthNavigationProp } from '../../navigation/types';

export function RegisterScreen() {
  const navigation = useNavigation<AuthNavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { register, loginWithGoogle } = useAuth();
  const { showError } = useSnackbar();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const allRulesMet = passwordRules.every(r => r.test(password));
  const canSubmit = !loading && name && emailValid && allRulesMet;

  const handleRegister = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await register(email, password, name);
    } catch (e) {
      showError(getErrorMessage(e, 'Error al registrarse'));
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
          paddingTop: insets.top + spacing['2xl'],
          paddingBottom: insets.bottom + spacing['2xl'],
          paddingHorizontal: spacing.container,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[s.backButton, { backgroundColor: colors.surfaceContainerHigh, borderColor: colors.outlineVariant }]}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          accessibilityHint="Regresa a la pantalla anterior"
        >
          <Ionicons name="arrow-back" size={20} color={colors.onSurface} accessible={false} />
        </TouchableOpacity>

        <View style={s.heading}>
          <Text accessibilityRole="header" style={[typography.headlineLg, { color: colors.onSurface }]}>
            Crear cuenta
          </Text>
          <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant, marginTop: spacing.xs }]}>
            Regístrate para empezar a gestionar tus finanzas
          </Text>
        </View>

        <View style={s.form}>
          <Input
            label="Nombre"
            placeholder="Tu nombre"
            value={name}
            onChangeText={setName}
          />
          <View>
            <Input
              label="Correo electrónico"
              placeholder="tu@correo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View
              style={s.hint}
              accessibilityLiveRegion="polite"
            >
              <Ionicons
                name={emailValid ? 'checkmark-circle-outline' : 'ellipse-outline'}
                size={14}
                color={emailValid ? colors.success : colors.onSurfaceVariant}
                accessible={false}
              />
              <Text style={[typography.bodySm, { color: emailValid ? colors.success : colors.onSurfaceVariant }]}>
                Formato de correo válido
              </Text>
            </View>
          </View>
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
            <View style={s.requirements}>
              <PasswordRequirements password={password} />
            </View>
          </View>
        </View>

        <GradientButton
          title="Crear cuenta"
          onPress={handleRegister}
          loading={loading}
          disabled={!canSubmit}
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
          accessibilityLabel="Registrarse con Google"
          accessibilityState={{ disabled: loading, busy: loading }}
        >
          <Ionicons name="logo-google" size={20} color={colors.primary} accessible={false} />
          <Text style={[typography.labelLg, { color: colors.onSurface, marginLeft: spacing.sm }]}>
            Registrarse con Google
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.loginLink}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel="Inicia sesión"
          accessibilityHint="Volver al inicio de sesión"
        >
          <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant }]}>
            ¿Ya tienes cuenta?{' '}
            <Text style={{ color: colors.primary, textDecorationLine: 'underline' }}>
              Inicia sesión
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  backButton: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    borderRadius: borderRadius.md,
    borderWidth: strokeWidth.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heading: {
    marginBottom: spacing.xl,
  },
  form: {
    gap: spacing.md,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingLeft: spacing.xs,
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
  requirements: {
    marginTop: spacing.xs,
    paddingLeft: spacing.xs,
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
  loginLink: {
    alignSelf: 'center',
    minHeight: layout.touchTarget,
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
});
