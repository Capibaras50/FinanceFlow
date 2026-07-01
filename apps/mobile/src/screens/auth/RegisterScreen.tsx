import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
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
import { PasswordRequirements, passwordRules } from '../../components/auth/PasswordRequirements';
import { useNavigation } from '@react-navigation/native';
import type { AuthNavigationProp } from '../../navigation/types';

export function RegisterScreen() {
  const navigation = useNavigation<AuthNavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + spacing['2xl'], paddingHorizontal: spacing.container, paddingBottom: insets.bottom + spacing['2xl'] }}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: colors.surfaceContainerHigh,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.lg,
          }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.onSurface} />
        </TouchableOpacity>

        <View style={{ marginBottom: spacing['2xl'] }}>
          <Text style={[typography.headlineLg, { color: colors.onSurface }]}>
            Crear Cuenta
          </Text>
          <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant, marginTop: spacing.xs }]}>
            Registrate para empezar a gestionar tus finanzas
          </Text>
        </View>

        <View style={{ gap: spacing.md }}>
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
            <View style={{ marginTop: spacing.xs, marginLeft: 4 }}>
              <Text style={[typography.bodySm, { color: emailValid ? colors.success : colors.onSurfaceVariant }]}>
                {email.length > 0 && !emailValid ? '✗' : '✓'} Formato de correo válido
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
              style={{ position: 'absolute', right: 12, bottom: 14 }}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>
            <View style={{ marginTop: spacing.xs, marginLeft: 4 }}>
              <PasswordRequirements password={password} />
            </View>
          </View>
        </View>

        <GradientButton
          title="Crear Cuenta"
          onPress={handleRegister}
          disabled={!canSubmit}
          style={{ marginTop: spacing['2xl'] }}
        />

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            marginTop: spacing.md,
            paddingVertical: spacing.md,
            borderRadius: borderRadius.full,
            alignItems: 'center',
          }}
        >
          <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant }]}>
            ¿Ya tienes cuenta?{' '}
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
