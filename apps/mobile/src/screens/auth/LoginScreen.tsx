import { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../context/SnackbarContext';
import { Input } from '../../components/ui/Input';
import { GradientButton } from '../../components/ui/GradientButton';
import { getErrorMessage } from '../../utils/format';
import { useNavigation } from '@react-navigation/native';
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
      <View style={{ flex: 1, paddingTop: insets.top + spacing['2xl'], paddingHorizontal: spacing.container }}>
        <View style={styles.header}>
          <LinearGradient
            colors={colors.gradient.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoCircle}
          >
            <Ionicons name="wallet" size={36} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[typography.displayMd, { color: colors.onSurface }]}>
            Finance Flow
          </Text>
          <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant, marginTop: spacing.xs }]}>
            Tu dinero, con inteligencia
          </Text>
        </View>

        <View style={{ gap: spacing.md }}>
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
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotLink}
          >
            <Text style={[typography.bodySm, { color: colors.primary }]}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>
        </View>

        <GradientButton
          title="Iniciar Sesión"
          onPress={handleLogin}
          disabled={loading || !email || !password}
          style={{ marginTop: spacing['2xl'] }}
        />

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.outlineVariant }]} />
          <Text style={[typography.bodySm, { color: colors.onSurfaceVariant, marginHorizontal: spacing.md }]}>
            O
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.outlineVariant }]} />
        </View>

        <TouchableOpacity
          onPress={handleGoogleLogin}
          style={[styles.googleButton, { borderColor: colors.outlineVariant }]}
          disabled={loading}
        >
          <Ionicons name="logo-google" size={20} color={colors.onSurface} />
          <Text style={[typography.labelLg, { color: colors.onSurface, marginLeft: spacing.sm }]}>
            Continuar con Google
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={[styles.registerButton, { borderColor: colors.primary }]}
        >
          <Text style={[typography.labelLg, { color: colors.primary }]}>
            Registrarse
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    bottom: 14,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: spacing.xs,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  googleButton: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    alignItems: 'center',
  },
});
