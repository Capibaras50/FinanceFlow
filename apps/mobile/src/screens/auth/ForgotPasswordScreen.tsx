import { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import { useSnackbar } from '../../context/SnackbarContext';
import { Input } from '../../components/ui/Input';
import { GradientButton } from '../../components/ui/GradientButton';
import { authApi } from '../../services/api';
import { getErrorMessage } from '../../utils/format';
import type { AuthNavigationProp } from '../../navigation/types';
import { useNavigation } from '@react-navigation/native';

export function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AuthNavigationProp>();
  const { showSuccess, showError } = useSnackbar();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      showSuccess('Correo enviado. Revisa tu bandeja de entrada.');
    } catch (e) {
      showError(getErrorMessage(e, 'Error al enviar correo'));
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={[styles.container, { paddingTop: insets.top + spacing['2xl'] }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: colors.surfaceContainerHigh }]}
        >
          <Ionicons name="arrow-back" size={20} color={colors.onSurface} />
        </TouchableOpacity>

        <View style={[styles.logoContainer, { backgroundColor: colors.primaryContainer }]}>
          <Ionicons name="lock-open" size={32} color="#FFFFFF" />
        </View>

        <Text style={[typography.headlineLg, { color: colors.onSurface }]}>
          Recuperar contraseña
        </Text>
        <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant, marginTop: spacing.xs, textAlign: 'center' }]}>
          {sent
            ? 'Te hemos enviado un correo con las instrucciones para restablecer tu contraseña.'
            : 'Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.'}
        </Text>

        {!sent && (
          <>
            <View style={{ marginTop: spacing['2xl'], width: '100%' }}>
              <Input
                label="Correo electrónico"
                placeholder="tu@correo.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <GradientButton
              title="Enviar enlace"
              onPress={handleSend}
              disabled={loading || !email}
              style={{ marginTop: spacing['2xl'] }}
            />
          </>
        )}

        {sent && (
          <GradientButton
            title="Volver al inicio"
            onPress={() => navigation.navigate('Login')}
            style={{ marginTop: spacing['2xl'] }}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.container,
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginBottom: spacing['2xl'],
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
});
