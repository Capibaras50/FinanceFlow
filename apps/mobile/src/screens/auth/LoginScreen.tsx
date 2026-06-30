import { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useSnackbar } from '../../context/SnackbarContext';
import { Input } from '../../components/ui/Input';
import { GradientButton } from '../../components/ui/GradientButton';

export function LoginScreen({ navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
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
    } catch (e: any) {
      showError(e?.message || 'Error al iniciar sesión');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={{ flex: 1, paddingTop: insets.top + spacing['2xl'], paddingHorizontal: spacing.container }}>
        <View style={{ alignItems: 'center', marginBottom: spacing['2xl'] }}>
          <LinearGradient
            colors={colors.gradient.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.md,
            }}
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
              style={{ position: 'absolute', right: 12, bottom: 14 }}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>
        </View>

        <GradientButton
          title="Iniciar Sesión"
          onPress={handleLogin}
          disabled={loading || !email || !password}
          style={{ marginTop: spacing['2xl'] }}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={{
            marginTop: spacing.md,
            paddingVertical: spacing.md,
            borderRadius: borderRadius.full,
            borderWidth: 1.5,
            borderColor: colors.primary,
            alignItems: 'center',
          }}
        >
          <Text style={[typography.labelLg, { color: colors.primary }]}>
            Registrarse
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
