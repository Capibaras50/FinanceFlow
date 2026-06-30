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
import { useNavigation } from '@react-navigation/native';
import type { AuthNavigationProp } from '../../navigation/types';

const passwordRules = [
  { key: 'min', label: 'Al menos 8 caracteres', test: (p: string) => p.length >= 8 },
  { key: 'upper', label: 'Al menos una mayúscula', test: (p: string) => /[A-Z]/.test(p) },
  { key: 'lower', label: 'Mínimo 5 minúsculas', test: (p: string) => (p.match(/[a-z]/g) || []).length >= 5 },
  { key: 'number', label: 'Al menos un número', test: (p: string) => /[0-9]/.test(p) },
  { key: 'symbol', label: 'Al menos un símbolo', test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

function RequirementRow({ label, met }: { label: string; met: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
      <Ionicons
        name={met ? 'checkmark-circle' : 'ellipse-outline'}
        size={16}
        color={met ? colors.success : colors.onSurfaceVariant}
      />
      <Text style={[typography.bodySm, { color: met ? colors.success : colors.onSurfaceVariant }]}>
        {label}
      </Text>
    </View>
  );
}

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

  const rules = useMemo(() =>
    passwordRules.map(r => ({ ...r, met: r.test(password) })),
    [password]
  );

  const allMet = rules.every(r => r.met);
  const canSubmit = !loading && name && emailValid && allMet;

  const handleRegister = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await register(email, password, name);
    } catch (e: any) {
      showError(e?.message || 'Error al registrarse');
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
              <RequirementRow label="Formato de correo válido" met={email.length > 0 && emailValid} />
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
            <View style={{ marginTop: spacing.xs, marginLeft: 4, gap: 2 }}>
              {rules.map(r => (
                <RequirementRow key={r.key} label={r.label} met={r.met} />
              ))}
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
